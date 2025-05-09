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
import { AxiosError } from 'axios';
import * as moment from 'moment';

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

    const params = {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode,
      videoCategoryId,
      maxResults,
      pageToken,
      hl,
      key: this._apiKey,
    };

    const url = `${this._baseUrl}/videos`;

    try {
      this._logger.log(
        `Mengambil video trending dari YouTube API. URL: ${url}, Params: ${JSON.stringify({ ...params, key: 'REDACTED_API_KEY' })}`,
      );
      const response = await firstValueFrom(
        this._httpService.get(url, { params }),
      );

      const youtubeData = response.data;
      const items: TrendingVideoItemDto[] = youtubeData.items.map((item: any) =>
        this._transformVideoItem(item),
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

    const searchParams: any = {
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
        const detailsResponse = await firstValueFrom(
          this._httpService.get(detailsUrl, { params: detailsParams }),
        );
        detailsResponse.data.items.forEach((videoItem: any) => {
          videoDetailsMap.set(videoItem.id, videoItem);
        });
      }

      const items: SearchVideoItemDto[] = searchData.items
        .filter((item: any) => item.id && item.id.videoId)
        .map((searchItem: any) =>
          this._transformSearchItem(
            searchItem,
            videoDetailsMap.get(searchItem.id.videoId),
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
   * @returns Promise berisi detail video.
   * @throws HttpException jika video tidak ditemukan atau terjadi error API.
   */
  async getVideoDetails(videoId: string): Promise<TrendingVideoItemDto> {
    const params = {
      part: 'snippet,contentDetails,statistics',
      id: videoId,
      key: this._apiKey,
      hl: 'id',
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
        throw error;
      }
      this._handleApiError(error, `mengambil detail video ID ${videoId}`);
    }
  }

  /**
   * Mentransformasi item video dari respons YouTube API ke format DTO.
   * @param item Item video mentah dari API.
   * @returns Objek TrendingVideoItemDto.
   * @private
   */
  private _transformVideoItem(item: any): TrendingVideoItemDto {
    const viewCount = parseInt(item.statistics?.viewCount || '0', 10);
    const publishedAtString = item.snippet?.publishedAt;
    const publishedAtMoment = moment.utc(publishedAtString);

    const hoursSincePublished =
      publishedAtString && publishedAtMoment.isValid()
        ? moment.utc().diff(publishedAtMoment, 'hours', true)
        : 0;

    const vph = hoursSincePublished > 0 ? viewCount / hoursSincePublished : 0;
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
        publishedAtString && publishedAtMoment.isValid()
          ? publishedAtMoment.fromNow()
          : 'N/A',
      formatted_duration: this._formatYtDuration(item.contentDetails?.duration),
      tags: item.snippet?.tags || [],
    };
  }

  /**
   * Memformat angka besar menjadi K (ribu) atau M (juta).
   * @param num Angka yang akan diformat.
   * @returns String angka yang telah diformat.
   * @private
   */
  private _formatNumber(num: number): string {
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
    const duration = moment.duration(durationString);
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    let formatted = '';
    if (hours > 0) {
      formatted += `${hours}:`;
      formatted += `${minutes.toString().padStart(2, '0')}:`;
    } else {
      formatted += `${minutes}:`;
    }
    formatted += seconds.toString().padStart(2, '0');
    return formatted;
  }

  /**
   * Menangani error dari panggilan API.
   * @param error Objek error.
   * @param action Deskripsi aksi yang gagal.
   * @private
   */
  private _handleApiError(error: any, action: string): never {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const errorData = axiosError.response.data as any;
      const apiErrorMessage =
        errorData?.error?.message || 'Error tidak diketahui dari YouTube API.';
      const errorStatus =
        axiosError.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      this._logger.error(
        `Error dari YouTube API saat ${action} (Status: ${errorStatus}): ${apiErrorMessage}`,
        JSON.stringify(errorData.error?.errors),
      );
      throw new HttpException(apiErrorMessage, errorStatus);
    } else if (axiosError.request) {
      this._logger.error(
        `Tidak ada respons dari YouTube API saat ${action}:`,
        axiosError.message,
      );
      throw new HttpException(
        'Tidak ada respons dari layanan YouTube.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      this._logger.error(
        `Error saat menyiapkan permintaan ke YouTube API untuk ${action}:`,
        axiosError.message,
      );
      throw new HttpException(
        `Gagal menghubungi layanan YouTube: ${axiosError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Mentransformasi item dari hasil pencarian YouTube API ke format DTO,
   * diperkaya dengan detail video dari panggilan API terpisah.
   * @param searchApiItem Item mentah dari API pencarian.
   * @param videoApiItem Item mentah detail video dari API video (bisa undefined).
   * @returns Objek SearchVideoItemDto.
   * @private
   */
  private _transformSearchItem(
    searchApiItem: any,
    videoApiItem?: any,
  ): SearchVideoItemDto {
    const searchSnippet = searchApiItem.snippet;
    const effectiveSnippet = videoApiItem?.snippet || searchSnippet;
    const statistics = videoApiItem?.statistics;
    const contentDetails = videoApiItem?.contentDetails;

    const viewCount = statistics?.viewCount
      ? parseInt(statistics.viewCount, 10)
      : null;
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
      video_id: searchApiItem.id.videoId,
      published_at: publishedAtString,
      channel_id: effectiveSnippet?.channelId,
      title: effectiveSnippet?.title,
      description: effectiveSnippet?.description,
      thumbnail_default_url: effectiveSnippet?.thumbnails?.default?.url,
      thumbnail_medium_url: effectiveSnippet?.thumbnails?.medium?.url,
      thumbnail_high_url: effectiveSnippet?.thumbnails?.high?.url,
      channel_title: effectiveSnippet?.channelTitle,
      live_broadcast_content: searchSnippet?.liveBroadcastContent,
      view_count: viewCount,
      like_count: likeCountRaw ? parseInt(likeCountRaw, 10) : null,
      comment_count: statistics?.commentCount
        ? parseInt(statistics.commentCount, 10)
        : null,
      duration: contentDetails?.duration || null,
      vph: vph !== null ? parseFloat(vph.toFixed(2)) : null,
      formatted_view_count:
        viewCount !== null ? this._formatNumber(viewCount) : null,
      formatted_like_count: likeCountRaw
        ? this._formatNumber(parseInt(likeCountRaw, 10))
        : null,
      formatted_vph: vph !== null ? `${this._formatNumber(vph)}/hr` : null,
      time_since_upload:
        publishedAtMoment && publishedAtMoment.isValid()
          ? publishedAtMoment.fromNow()
          : 'N/A',
      formatted_duration: contentDetails?.duration
        ? this._formatYtDuration(contentDetails.duration)
        : null,
      tags: effectiveSnippet?.tags || [],
    };
  }
}
