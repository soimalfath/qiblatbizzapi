import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import youtubeConfiguration, {
  IYoutubeConfig,
} from '../../config/youtube.config';
import { firstValueFrom } from 'rxjs';
import { GetTrendingVideosDto } from './dto/get-trending-videos.dto';
import {
  TrendingVideoItemDto,
  TrendingVideosResponseDto,
} from './dto/trending-video.dto';
import { SearchVideosDto } from './dto/search-videos.dto';
import { SearchVideoItemDto } from './dto/search-video-item.dto';
import { SearchVideosResponseDto } from './dto/search-videos-response.dto';
import { GetVideoCategoriesDto } from './dto/get-video-categories.dto';
import {
  VideoCategoriesResponseDto,
  // VideoCategoryItemDto, // This was imported but not used in the first class definition
} from './dto/video-category.dto';
import { AxiosError } from 'axios'; // Import AxiosError
import * as moment from 'moment';
import {
  ChannelDetailsDto,
  ChannelListResponseDto,
} from './dto/channel-details.dto'; // <-- Tambahkan impor ini

/**
 * Service untuk mengelola operasi terkait YouTube API.
 */
@Injectable()
export class YoutubeService {
  private readonly _logger = new Logger(YoutubeService.name);
  private readonly _apiKey: string;
  private readonly _baseUrl: string;

  /**
   * Konstruktor YoutubeService.
   * @param _httpService HttpService untuk melakukan request HTTP.
   * @param _ytConfig Konfigurasi YouTube yang telah di-inject.
   */
  constructor(
    private readonly _httpService: HttpService,
    @Inject(youtubeConfiguration.KEY)
    private readonly _ytConfig: IYoutubeConfig,
  ) {
    this._apiKey = this._ytConfig.apiKey;
    this._baseUrl = this._ytConfig.baseUrl;
  }

  /**
   * Helper method to fetch details for multiple channels in batches.
   * @param channelIds Array of YouTube channel IDs.
   * @param hl Language code for the response.
   * @returns A Map where keys are channel IDs and values are objects with imageUrl and subscriberCount.
   */
  private async _getChannelsDetailsBatch(
    channelIds: string[],
    hl?: string,
  ): Promise<Map<string, { imageUrl?: string; subscriberCount?: string }>> {
    const channelDetailsMap = new Map<
      string,
      { imageUrl?: string; subscriberCount?: string }
    >();
    if (!channelIds || channelIds.length === 0) {
      return channelDetailsMap;
    }

    const uniqueChannelIds = Array.from(new Set(channelIds));
    const batchSize = 50; // YouTube API allows up to 50 IDs per request for channels

    for (let i = 0; i < uniqueChannelIds.length; i += batchSize) {
      const batchIds = uniqueChannelIds.slice(i, i + batchSize);
      const params = {
        part: 'snippet,statistics',
        id: batchIds.join(','),
        key: this._apiKey,
        hl,
      };
      const url = `${this._baseUrl}/channels`;
      try {
        this._logger.log(
          `Fetching batch channel details. URL: ${url}, IDs count: ${batchIds.length}`,
        );
        const response = await firstValueFrom(
          this._httpService.get(url, { params }),
        );
        response.data.items?.forEach((channel: any) => {
          channelDetailsMap.set(channel.id, {
            imageUrl: channel.snippet?.thumbnails?.default?.url, // Anda bisa memilih default, medium, atau high
            subscriberCount: channel.statistics?.subscriberCount,
          });
        });
      } catch (error) {
        this._logger.error(
          `Failed to fetch batch channel details for IDs: ${batchIds.join(',')}. Error: ${error.message}`,
        );
        // Melanjutkan untuk batch berikutnya, beberapa data channel mungkin hilang
      }
    }
    return channelDetailsMap;
  }

  /**
   * Mengambil daftar video trending dari YouTube.
   * @param dto Parameter query untuk filter dan paginasi.
   * @returns Promise berisi daftar video trending dan info paginasi.
   */
  async getTrendingVideos(
    dto: GetTrendingVideosDto,
  ): Promise<TrendingVideosResponseDto> {
    const {
      regionCode,
      videoCategoryId,
      maxResults,
      pageToken,
      hl = 'id',
    } = dto;

    const params: Record<string, any> = {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      maxResults,
      pageToken,
      hl,
      key: this._apiKey,
    };

    if (regionCode) {
      params.regionCode = regionCode;
    }
    if (videoCategoryId) {
      params.videoCategoryId = videoCategoryId;
    }

    const url = `${this._baseUrl}/videos`;

    try {
      this._logger.log(
        `Mengambil video trending dari YouTube API. URL: ${url}, Params: ${JSON.stringify({ ...params, key: 'REDACTED_API_KEY' })}`,
      );
      const response = await firstValueFrom(
        this._httpService.get(url, { params }),
      );

      const youtubeData = response.data;

      const uniqueChannelIds = Array.from(
        new Set(
          youtubeData.items
            ?.map((item: any) => item.snippet?.channelId)
            .filter(Boolean) || [],
        ),
      ) as string[];

      const channelsDataMap = await this._getChannelsDetailsBatch(
        uniqueChannelIds,
        hl,
      );

      const items: TrendingVideoItemDto[] = youtubeData.items.map((item: any) =>
        this._transformVideoItem(
          item,
          channelsDataMap.get(item.snippet?.channelId), // Corrected line
        ),
      );

      return {
        items,
        next_page_token: youtubeData.nextPageToken,
        prev_page_token: youtubeData.prevPageToken,
        page_info: {
          total_results: youtubeData.pageInfo.totalResults,
          results_per_page: youtubeData.pageInfo.resultsPerPage,
        },
      };
    } catch (error) {
      this._handleApiError(error, 'mengambil video trending');
    }
  }

  /**
   * Melakukan pencarian video di YouTube berdasarkan kata kunci.
   * @param dto Parameter query untuk pencarian.
   * @returns Promise berisi daftar video hasil pencarian dan info paginasi.
   */
  async searchVideos(dto: SearchVideosDto): Promise<SearchVideosResponseDto> {
    const {
      q,
      order = 'relevance',
      maxResults = 10,
      pageToken,
      regionCode,
      hl = 'id',
      type = 'video',
    } = dto;

    const searchParams: Record<string, any> = {
      part: 'snippet',
      q,
      order,
      maxResults,
      type,
      key: this._apiKey,
    };

    if (pageToken) {
      searchParams.pageToken = pageToken;
    }
    if (regionCode) {
      searchParams.regionCode = regionCode;
    }
    if (hl) {
      searchParams.hl = hl;
    }

    const searchUrl = `${this._baseUrl}/search`;

    try {
      this._logger.log(
        `Melakukan pencarian video di YouTube API. URL: ${searchUrl}, Params: ${JSON.stringify({ ...searchParams, key: 'REDACTED_API_KEY' })}`,
      );
      const searchResponse = await firstValueFrom(
        this._httpService.get(searchUrl, { params: searchParams }),
      );

      const searchData = searchResponse.data;
      const videoIds = searchData.items
        .filter((item: any) => item.id && item.id.videoId)
        .map((item: any) => item.id.videoId);

      const videoDetailsMap = new Map<string, any>();

      if (videoIds.length > 0) {
        const detailsParams = {
          part: 'snippet,contentDetails,statistics',
          id: videoIds.join(','),
          key: this._apiKey,
          hl,
        };
        const detailsUrl = `${this._baseUrl}/videos`;
        this._logger.log(
          `Mengambil detail untuk video hasil pencarian. URL: ${detailsUrl}, Params: ${JSON.stringify({ ...detailsParams, key: 'REDACTED_API_KEY' })}`,
        );
        const detailsResponse = await firstValueFrom(
          this._httpService.get(detailsUrl, { params: detailsParams }),
        );
        detailsResponse.data.items.forEach((videoItem: any) => {
          videoDetailsMap.set(videoItem.id, videoItem);
        });
      }

      const uniqueChannelIds = Array.from(
        new Set(
          searchData.items
            ?.map((item: any) => item.snippet?.channelId)
            .filter(Boolean) || [],
        ),
      ) as string[];

      const channelsDataMap = await this._getChannelsDetailsBatch(
        uniqueChannelIds,
        hl,
      );

      const items: SearchVideoItemDto[] = searchData.items
        .filter((item: any) => item.id && item.id.videoId)
        .map((searchItem: any) =>
          this._transformSearchItem(
            searchItem,
            videoDetailsMap.get(searchItem.id.videoId),
            channelsDataMap.get(searchItem.snippet?.channelId),
          ),
        );

      return {
        items,
        next_page_token: searchData.nextPageToken,
        region_code: searchData.regionCode,
        page_info: {
          total_results: searchData.pageInfo.totalResults,
          results_per_page: searchData.pageInfo.resultsPerPage,
        },
      };
    } catch (error) {
      this._handleApiError(error, 'melakukan pencarian video');
    }
  }

  /**
   * Mengambil detail video spesifik dari YouTube berdasarkan ID.
   * @param videoId ID video YouTube.
   * @param hl Bahasa untuk respons (opsional, default 'id').
   * @returns Promise berisi detail video.
   * @throws HttpException jika video tidak ditemukan atau terjadi error API.
   */
  async getVideoDetails(
    videoId: string,
    hl: string = 'id',
  ): Promise<TrendingVideoItemDto> {
    const params = {
      part: 'snippet,contentDetails,statistics',
      id: videoId,
      key: this._apiKey,
      hl,
    };

    const url = `${this._baseUrl}/videos`;

    try {
      this._logger.log(
        `Mengambil detail video dari YouTube API. URL: ${url}, Params: ${JSON.stringify({ ...params, key: 'REDACTED_API_KEY' })}`,
      );
      const response = await firstValueFrom(
        this._httpService.get(url, { params }),
      );

      const youtubeData = response.data;
      if (!youtubeData.items || youtubeData.items.length === 0) {
        this._logger.warn(`Video dengan ID "${videoId}" tidak ditemukan.`);
        throw new HttpException('Video tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      const videoItem = youtubeData.items[0];
      return this._transformVideoItem(videoItem);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw if already an HttpException
      }
      this._handleApiError(error, `mengambil detail video ID ${videoId}`);
    }
  }

  /**
   * @method getVideoCategories
   * @description Retrieves a list of video categories for a specified region.
   * @param {GetVideoCategoriesDto} params - The parameters for fetching video categories, including regionCode and optional language.
   * @returns {Promise<VideoCategoriesResponseDto>} A promise that resolves to the list of video categories.
   * @throws {HttpException} If the API request fails or returns an error.
   */
  async getVideoCategories(
    paramsDto: GetVideoCategoriesDto, // Renamed to avoid conflict with 'params' variable
  ): Promise<VideoCategoriesResponseDto> {
    const { regionCode, hl } = paramsDto;
    const url = `${this._baseUrl}/videoCategories`;
    const queryParams = {
      // Renamed to avoid conflict
      part: 'snippet',
      regionCode: regionCode,
      key: this._apiKey,
      hl: hl || 'en_US', // Default to English if not specified
    };

    this._logger.log(
      `Fetching video categories for region: ${regionCode}, language: ${queryParams.hl}. URL: ${url}, Params: ${JSON.stringify({ ...queryParams, key: 'REDACTED_API_KEY' })}`,
    );

    try {
      const response = await firstValueFrom(
        this._httpService.get<VideoCategoriesResponseDto>(url, {
          params: queryParams,
        }),
      );
      this._logger.log(
        `Successfully fetched ${response.data.items.length} video categories.`,
      );
      return response.data; // Directly return data as HttpService already maps it
    } catch (error) {
      // Error handling should be consistent with _handleApiError
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as any;
        const apiErrorMessage =
          errorData?.error?.message ||
          'Error tidak diketahui dari YouTube API saat mengambil kategori video.';
        const errorStatus =
          axiosError.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
        this._logger.error(
          `Error dari YouTube API saat mengambil kategori video (Status: ${errorStatus}): ${apiErrorMessage}`,
          JSON.stringify(errorData.error?.errors),
        );
        throw new HttpException(apiErrorMessage, errorStatus);
      } else if (axiosError.request) {
        this._logger.error(
          `Tidak ada respons dari YouTube API saat mengambil kategori video:`,
          axiosError.message,
        );
        throw new HttpException(
          'Tidak ada respons dari layanan YouTube.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        this._logger.error(
          `Error saat menyiapkan permintaan ke YouTube API untuk mengambil kategori video:`,
          axiosError.message,
        );
        throw new HttpException(
          `Gagal menghubungi layanan YouTube: ${axiosError.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Mentransformasi item video dari respons YouTube API ke format DTO.
   * @param item Item video mentah dari API.
   * @param channelDetails Detail channel opsional (gambar, subscriber).
   * @returns Objek TrendingVideoItemDto.
   * @private
   */
  private _transformVideoItem(
    item: any,
    channelDetails?: { imageUrl?: string; subscriberCount?: string },
  ): TrendingVideoItemDto {
    const viewCount = parseInt(item.statistics?.viewCount || '0', 10);
    const publishedAtString = item.snippet?.publishedAt;
    const publishedAtMoment = publishedAtString
      ? moment.utc(publishedAtString)
      : null; // Handle null publishedAtString

    const hoursSincePublished =
      publishedAtMoment && publishedAtMoment.isValid() // Check if publishedAtMoment is not null
        ? moment.utc().diff(publishedAtMoment, 'hours', true)
        : 0;

    const vph =
      viewCount && hoursSincePublished > 0
        ? viewCount / hoursSincePublished
        : 0; // Check viewCount
    const likeCountRaw = item.statistics?.likeCount;

    return {
      id: item.id,
      title: item.snippet?.title,
      thumbnail_url: item.snippet?.thumbnails?.default?.url,
      medium_thumbnail_url: item.snippet?.thumbnails?.medium?.url,
      high_thumbnail_url: item.snippet?.thumbnails?.high?.url,
      channel_title: item.snippet?.channelTitle,
      channel_id: item.snippet?.channelId,
      view_count: viewCount,
      like_count: likeCountRaw ? parseInt(likeCountRaw, 10) : null,
      comment_count: item.statistics?.commentCount
        ? parseInt(item.statistics.commentCount, 10)
        : null,
      published_at: publishedAtString,
      duration: item.contentDetails?.duration,
      vph: parseFloat(vph.toFixed(2)),
      formatted_view_count: this._formatNumber(viewCount),
      formatted_like_count: likeCountRaw
        ? this._formatNumber(parseInt(likeCountRaw, 10))
        : null,
      formatted_vph: `${this._formatNumber(vph)}/hr`,
      time_since_upload:
        publishedAtMoment && publishedAtMoment.isValid() // Check if publishedAtMoment is not null
          ? publishedAtMoment.fromNow()
          : 'N/A',
      formatted_duration: this._formatYtDuration(item.contentDetails?.duration),
      tags: item.snippet?.tags || [],
      // Add channel image and subscriber count
      channel_image: channelDetails?.imageUrl,
      subscriber_count: channelDetails?.subscriberCount,
    };
  }

  /**
   * Memformat angka besar menjadi K (ribu) atau M (juta).
   * @param num Angka yang akan diformat.
   * @returns String angka yang telah diformat.
   * @private
   */
  private _formatNumber(num: number | null): string {
    // Allow null for num
    if (num === null || num === undefined) return 'N/A'; // Handle null or undefined
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  /**
   * Memformat durasi ISO 8601 YouTube menjadi format jam:menit:detik.
   * @param durationString Durasi dalam format ISO 8601.
   * @returns String durasi yang diformat.
   * @private
   */
  private _formatYtDuration(durationString?: string): string {
    if (!durationString) return 'N/A';
    try {
      const duration = moment.duration(durationString);
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      let formatted = '';
      if (hours > 0) {
        formatted += `${hours}:`;
        formatted += `${minutes.toString().padStart(2, '0')}:`;
        formatted += seconds.toString().padStart(2, '0');
      } else if (minutes > 0) {
        formatted += `${minutes}:`;
        formatted += seconds.toString().padStart(2, '0');
      } else {
        formatted += `0:${seconds.toString().padStart(2, '0')}`;
      }
      return formatted;
    } catch (e) {
      this._logger.warn(`Could not parse duration string: ${durationString}`);
      return 'N/A';
    }
  }

  /**
   * Menangani error dari panggilan API.
   * @param error Objek error.
   * @param action Deskripsi aksi yang gagal.
   * @private
   * @throws HttpException
   */
  private _handleApiError(error: any, action: string): never {
    const axiosError = error as AxiosError;
    let message = `Gagal ${action}.`;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (axiosError.response) {
      const errorData = axiosError.response.data as any;
      message =
        errorData?.error?.message ||
        `Error tidak diketahui dari YouTube API saat ${action}.`;
      status = axiosError.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      this._logger.error(
        `Error dari YouTube API saat ${action} (Status: ${status}): ${message}`,
        JSON.stringify(errorData?.error?.errors), // Log specific errors if available
      );
    } else if (axiosError.request) {
      message = `Tidak ada respons dari layanan YouTube saat ${action}.`;
      status = HttpStatus.SERVICE_UNAVAILABLE;
      this._logger.error(`${message}:`, axiosError.message);
    } else {
      message = `Error saat menyiapkan permintaan ke YouTube API untuk ${action}: ${axiosError.message}`;
      this._logger.error(message);
    }
    throw new HttpException(message, status);
  }

  /**
   * Mentransformasi item dari hasil pencarian YouTube API ke format DTO,
   * diperkaya dengan detail video dari panggilan API terpisah.
   * @param searchApiItem Item mentah dari API pencarian.
   * @param videoApiItem Item mentah detail video dari API video (bisa undefined).
   * @param channelDetails Detail channel opsional (gambar, subscriber).
   * @returns Objek SearchVideoItemDto.
   * @private
   */
  private _transformSearchItem(
    searchApiItem: any,
    videoApiItem?: any,
    channelDetails?: { imageUrl?: string; subscriberCount?: string },
  ): SearchVideoItemDto {
    const searchSnippet = searchApiItem.snippet;
    // Prioritize videoApiItem details if available, as search snippet can be less detailed
    const effectiveSnippet = videoApiItem?.snippet || searchSnippet;
    const statistics = videoApiItem?.statistics;
    const contentDetails = videoApiItem?.contentDetails;

    const viewCount = statistics?.viewCount
      ? parseInt(statistics.viewCount, 10)
      : null; // Default to null if not available
    const publishedAtString = effectiveSnippet?.publishedAt;
    const publishedAtMoment = publishedAtString
      ? moment.utc(publishedAtString)
      : null;

    let hoursSincePublished = 0;
    if (publishedAtMoment && publishedAtMoment.isValid()) {
      hoursSincePublished = moment.utc().diff(publishedAtMoment, 'hours', true);
    }

    let vph = null;
    if (viewCount !== null && hoursSincePublished > 0) {
      vph = viewCount / hoursSincePublished;
    }

    const likeCountRaw = statistics?.likeCount;

    return {
      video_id: searchApiItem.id.videoId, // videoId is always from searchApiItem
      published_at: publishedAtString,
      channel_id: effectiveSnippet?.channelId,
      title: effectiveSnippet?.title,
      description: effectiveSnippet?.description,
      thumbnail_default_url: effectiveSnippet?.thumbnails?.default?.url,
      thumbnail_medium_url: effectiveSnippet?.thumbnails?.medium?.url,
      thumbnail_high_url: effectiveSnippet?.thumbnails?.high?.url,
      channel_title: effectiveSnippet?.channelTitle,
      live_broadcast_content: searchSnippet?.liveBroadcastContent, // This is specific to search result snippet
      view_count: viewCount,
      like_count: likeCountRaw ? parseInt(likeCountRaw, 10) : null,
      comment_count: statistics?.commentCount // Assuming this was a typo and should be from statistics
        ? parseInt(statistics.commentCount, 10)
        : null,
      duration: contentDetails?.duration,
      vph: vph !== null ? parseFloat(vph.toFixed(2)) : null,
      formatted_view_count: this._formatNumber(viewCount),
      formatted_like_count: likeCountRaw
        ? this._formatNumber(parseInt(likeCountRaw, 10))
        : null,
      formatted_vph: vph !== null ? `${this._formatNumber(vph)}/hr` : 'N/A',
      time_since_upload:
        publishedAtMoment && publishedAtMoment.isValid()
          ? publishedAtMoment.fromNow()
          : 'N/A',
      formatted_duration: this._formatYtDuration(contentDetails?.duration),
      tags: effectiveSnippet?.tags || [],
      // Add channel image and subscriber count
      channel_image: channelDetails?.imageUrl,
      subscriber_count: channelDetails?.subscriberCount,
    };
  }

  /**
   * @method getChannelDetails
   * @description Mengambil detail channel YouTube berdasarkan ID channel.
   * @param {string} channelId - ID unik dari channel YouTube.
   * @param {string} [hl='id'] - Kode bahasa untuk lokalisasi data (opsional, default 'id').
   * @returns {Promise<ChannelDetailsDto>} Detail channel.
   * @throws {HttpException} Jika channel tidak ditemukan atau terjadi error API.
   */
  async getChannelDetails(
    channelId: string,
    hl: string = 'id',
  ): Promise<ChannelDetailsDto> {
    const url = `${this._baseUrl}/channels`;
    const params = {
      part: 'snippet,statistics,brandingSettings,contentDetails',
      id: channelId,
      key: this._apiKey,
      hl,
    };

    this._logger.log(
      `Mengambil detail channel dari YouTube API. Channel ID: ${channelId}, URL: ${url}, Params: ${JSON.stringify({ ...params, key: 'REDACTED_API_KEY' })}`,
    );

    try {
      const response = await firstValueFrom(
        this._httpService.get<ChannelListResponseDto>(url, { params }),
      );

      const youtubeData = response.data;
      if (!youtubeData.items || youtubeData.items.length === 0) {
        this._logger.warn(`Channel dengan ID "${channelId}" tidak ditemukan.`);
        throw new HttpException(
          'Channel tidak ditemukan',
          HttpStatus.NOT_FOUND,
        );
      }

      // Treat channelItem from API as 'any' to avoid type conflicts during mapping
      // when the API structure (e.g., nested 'localized') differs from our DTO structure.
      const channelItemFromApi = youtubeData.items[0] as any;

      const transformedChannel: ChannelDetailsDto = {
        kind: channelItemFromApi.kind,
        etag: channelItemFromApi.etag,
        id: channelItemFromApi.id,
        snippet: {
          title: channelItemFromApi.snippet.title,
          description: channelItemFromApi.snippet.description,
          customUrl: channelItemFromApi.snippet.customUrl,
          publishedAt: channelItemFromApi.snippet.publishedAt,
          thumbnails: channelItemFromApi.snippet.thumbnails, // Assuming DTO and API structure match here
          localizedTitle: channelItemFromApi.snippet.localized?.title,
          localizedDescription:
            channelItemFromApi.snippet.localized?.description,
          country: channelItemFromApi.snippet.country,
        },
        statistics: {
          // Assuming DTO and API structure match for these fields
          viewCount: channelItemFromApi.statistics.viewCount,
          subscriberCount: channelItemFromApi.statistics.subscriberCount,
          hiddenSubscriberCount:
            channelItemFromApi.statistics.hiddenSubscriberCount,
          videoCount: channelItemFromApi.statistics.videoCount,
        },
        brandingSettings: channelItemFromApi.brandingSettings
          ? {
              image: channelItemFromApi.brandingSettings.image
                ? {
                    bannerExternalUrl:
                      channelItemFromApi.brandingSettings.image
                        .bannerExternalUrl,
                  }
                : undefined,
            }
          : undefined,
      };

      this._logger.log(
        `Berhasil mengambil detail untuk channel ID: ${channelId}`,
      );
      return transformedChannel;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Lempar ulang jika sudah HttpException
      }
      // Gunakan _handleApiError untuk konsistensi penanganan error
      this._handleApiError(error, `mengambil detail channel ID ${channelId}`);
    }
  }
}
