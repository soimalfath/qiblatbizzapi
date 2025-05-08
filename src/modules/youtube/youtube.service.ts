import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config'; // ConfigService mungkin tidak lagi dibutuhkan di sini jika hanya untuk youtube config
// import { ConfigType } from '@nestjs/config';
import youtubeConfiguration, {
  IYoutubeConfig,
} from '../../config/youtube.config'; // Impor konfigurasi dan tipenya
import { firstValueFrom } from 'rxjs';
import { GetTrendingVideosDto } from './dto/get-trending-videos.dto';
import {
  TrendingVideoItemDto, // Pastikan ini sudah diimpor atau tambahkan jika belum
  TrendingVideosResponseDto,
} from './dto/trending-video.dto';
import { SearchVideosDto } from './dto/search-videos.dto';
import { SearchVideoItemDto } from './dto/search-video-item.dto'; // Tambahkan impor ini
import { SearchVideosResponseDto } from './dto/search-videos-response.dto'; // Tambahkan impor ini
import { AxiosError } from 'axios';
import * as moment from 'moment'; // Pastikan moment sudah diimpor

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly api_key: string;
  private readonly base_url: string;

  constructor(
    private readonly http_service: HttpService,
    // Hapus ConfigService jika tidak digunakan untuk hal lain di service ini
    // private readonly config_service: ConfigService,
    @Inject(youtubeConfiguration.KEY) // Suntik konfigurasi YouTube yang sudah diproses
    private readonly yt_config: IYoutubeConfig,
  ) {
    // Mengambil nilai dari konfigurasi yang sudah disuntikkan
    this.api_key = this.yt_config.api_key;
    this.base_url = this.yt_config.base_url;

    // Validasi di sini menjadi redundan jika sudah divalidasi di youtube.config.ts
    // Namun, bisa dipertahankan sebagai lapisan pertahanan tambahan jika diinginkan,
    // atau jika konfigurasi bisa saja null/undefined karena alasan lain.
    // Untuk saat ini, kita asumsikan validasi di config cukup.
    // if (!this.api_key) {
    //   this.logger.error('YOUTUBE_API_KEY tidak dikonfigurasi melalui YoutubeConfig.');
    //   throw new Error('YOUTUBE_API_KEY tidak dikonfigurasi melalui YoutubeConfig.');
    // }
    // if (!this.base_url) {
    //   this.logger.error('YOUTUBE_API_BASE_URL tidak dikonfigurasi melalui YoutubeConfig.');
    //   throw new Error('YOUTUBE_API_BASE_URL tidak dikonfigurasi melalui YoutubeConfig.');
    // }
  }

  /**
   * Mengambil daftar video trending dari YouTube.
   * @param dto Parameter query untuk filter dan paginasi.
   * @returns Promise yang berisi daftar video trending dan informasi paginasi.
   */
  async get_trending_videos(
    dto: GetTrendingVideosDto,
  ): Promise<TrendingVideosResponseDto> {
    const {
      region_code = 'ID', // Default value jika tidak disediakan di DTO
      video_category_id = '0', // Default value
      max_results = 10, // Default value
      page_token,
      hl = 'id', // Default value
    } = dto;

    const params = {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode: region_code,
      videoCategoryId: video_category_id,
      maxResults: max_results,
      pageToken: page_token,
      hl: hl,
      key: this.api_key,
    };

    const url = `${this.base_url}/videos`;

    try {
      this.logger.log(
        `Mengambil video trending dari YouTube API. URL: ${url}, Params: ${JSON.stringify({ ...params, key: 'REDACTED_API_KEY' })}`, // API Key disembunyikan dari log
      );
      const response = await firstValueFrom(
        this.http_service.get(url, { params }),
      );

      const youtube_data = response.data;
      const items: TrendingVideoItemDto[] = youtube_data.items.map(
        (item: any) => this._transform_video_item(item),
      );

      return {
        items,
        next_page_token: youtube_data.nextPageToken,
        prev_page_token: youtube_data.prevPageToken,
        page_info: {
          total_results: youtube_data.pageInfo.totalResults,
          results_per_page: youtube_data.pageInfo.resultsPerPage,
        },
      };
    } catch (error) {
      this._handle_api_error(error, 'mengambil video trending');
    }
  }

  /**
   * Melakukan pencarian video di YouTube berdasarkan kata kunci.
   * @param dto Parameter query untuk pencarian.
   * @returns Promise yang berisi daftar video hasil pencarian dan informasi paginasi.
   */
  async search_videos(dto: SearchVideosDto): Promise<SearchVideosResponseDto> {
    const {
      q,
      order = 'relevance',
      max_results = 10,
      page_token,
      region_code,
      hl = 'id',
      type = 'video',
    } = dto;

    const search_params: any = {
      part: 'snippet',
      q: q,
      order: order,
      maxResults: max_results,
      type: type,
      key: this.api_key,
    };

    if (page_token) {
      search_params.pageToken = page_token;
    }
    if (region_code) {
      search_params.regionCode = region_code;
    }
    if (hl) {
      search_params.hl = hl;
    }

    const search_url = `${this.base_url}/search`;

    try {
      this.logger.log(
        `Mencari video dari YouTube API (Langkah 1 - Dapatkan ID). URL: ${search_url}, Params: ${JSON.stringify({ ...search_params, key: 'REDACTED_API_KEY' })}`,
      );
      const search_response = await firstValueFrom(
        this.http_service.get(search_url, { params: search_params }),
      );

      const search_data = search_response.data;
      const video_ids = search_data.items
        .filter((item: any) => item.id && item.id.videoId)
        .map((item: any) => item.id.videoId);

      const video_details_map = new Map<string, any>();

      if (video_ids.length > 0) {
        const details_params = {
          part: 'snippet,contentDetails,statistics', // Snippet juga diambil untuk konsistensi data terbaru
          id: video_ids.join(','),
          key: this.api_key,
          hl: hl, // Gunakan hl yang sama untuk konsistensi bahasa
        };
        const details_url = `${this.base_url}/videos`;
        this.logger.log(
          `Mengambil detail video dari YouTube API (Langkah 2 - Dapatkan Detail). URL: ${details_url}, Params: ${JSON.stringify({ ...details_params, key: 'REDACTED_API_KEY', id: video_ids })}`,
        );
        const details_response = await firstValueFrom(
          this.http_service.get(details_url, { params: details_params }),
        );
        details_response.data.items.forEach((video_item: any) => {
          video_details_map.set(video_item.id, video_item);
        });
      }

      const items: SearchVideoItemDto[] = search_data.items
        .filter((item: any) => item.id && item.id.videoId)
        .map((search_item: any) =>
          this._transform_search_item(
            search_item,
            video_details_map.get(search_item.id.videoId),
          ),
        );

      return {
        items,
        next_page_token: search_data.nextPageToken,
        region_code: search_data.regionCode,
        page_info: {
          total_results: search_data.pageInfo.totalResults,
          results_per_page: search_data.pageInfo.resultsPerPage,
        },
      };
    } catch (error) {
      this._handle_api_error(error, 'melakukan pencarian video');
    }
  }

  /**
   * Mengambil detail video spesifik dari YouTube berdasarkan ID.
   * @param video_id ID video YouTube.
   * @returns Promise yang berisi detail video.
   * @throws HttpException jika video tidak ditemukan atau terjadi error API.
   */
  async get_video_details(video_id: string): Promise<TrendingVideoItemDto> {
    const params = {
      part: 'snippet,contentDetails,statistics',
      id: video_id,
      key: this.api_key,
      hl: 'id', // Menyamakan dengan DTO lain untuk konsistensi bahasa
    };

    const url = `${this.base_url}/videos`;

    try {
      this.logger.log(
        `Mengambil detail video dari YouTube API. URL: ${url}, Params: ${JSON.stringify({ ...params, key: 'REDACTED_API_KEY' })}`,
      );
      const response = await firstValueFrom(
        this.http_service.get(url, { params }),
      );

      const youtube_data = response.data;
      if (!youtube_data.items || youtube_data.items.length === 0) {
        this.logger.warn(`Video dengan ID "${video_id}" tidak ditemukan.`);
        throw new HttpException('Video tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      // Endpoint /videos dengan parameter 'id' akan mengembalikan item dalam array 'items'
      const video_item = youtube_data.items[0];
      return this._transform_video_item(video_item);
    } catch (error) {
      // Jika error sudah HttpException (misalnya dari throw NOT_FOUND di atas), lempar kembali
      if (error instanceof HttpException) {
        throw error;
      }
      // Jika error lain, gunakan handler umum
      this._handle_api_error(error, `mengambil detail video ID ${video_id}`);
    }
  }

  /**
   * Mentransformasi item video dari respons YouTube API (trending) ke format DTO.
   * @param item Item video mentah dari API.
   * @returns Objek TrendingVideoItemDto.
   * @private
   */
  private _transform_video_item(item: any): TrendingVideoItemDto {
    const view_count = parseInt(item.statistics?.viewCount || '0', 10);
    const published_at_string = item.snippet?.publishedAt;
    const published_at_moment = moment.utc(published_at_string); // Parse the date string using moment.utc()

    const hours_since_published =
      published_at_string && published_at_moment.isValid()
        ? moment.utc().diff(published_at_moment, 'hours', true)
        : 0;

    const vph =
      hours_since_published > 0 ? view_count / hours_since_published : 0;
    const like_count_raw = item.statistics?.likeCount;

    return {
      id: item.id,
      title: item.snippet?.title,
      thumbnail_url: item.snippet?.thumbnails?.default?.url,
      medium_thumbnail_url: item.snippet?.thumbnails?.medium?.url,
      high_thumbnail_url: item.snippet?.thumbnails?.high?.url,
      channel_title: item.snippet?.channelTitle,
      channel_id: item.snippet?.channelId,
      view_count: view_count,
      like_count: like_count_raw ? parseInt(like_count_raw, 10) : null,
      comment_count: item.statistics?.commentCount
        ? parseInt(item.statistics.commentCount, 10)
        : null,
      published_at: published_at_string, // Keep original string for DTO
      duration: item.contentDetails?.duration,
      vph: parseFloat(vph.toFixed(2)),
      formatted_view_count: this._format_number(view_count),
      formatted_like_count: like_count_raw
        ? this._format_number(parseInt(like_count_raw, 10))
        : null,
      formatted_vph: `${this._format_number(vph)}/hr`,
      time_since_upload:
        published_at_string && published_at_moment.isValid()
          ? published_at_moment.fromNow()
          : 'N/A',
      formatted_duration: this._format_yt_duration(
        item.contentDetails?.duration,
      ),
      tags: item.snippet?.tags || [], // Tambahkan ini
    };
  }

  /**
   * Memformat angka besar menjadi K (ribu) atau M (juta).
   * @param num Angka yang akan diformat.
   * @returns String angka yang telah diformat.
   * @private
   */
  private _format_number(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  /**
   * Memformat durasi ISO 8601 YouTube (misal PT2M35S) menjadi format jam:menit:detik.
   * @param duration_string Durasi dalam format ISO 8601.
   * @returns String durasi yang diformat.
   * @private
   */
  private _format_yt_duration(duration_string?: string): string {
    if (!duration_string) return 'N/A';
    const duration = moment.duration(duration_string);
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
  private _handle_api_error(error: any, action: string): never {
    const axios_error = error as AxiosError;
    if (axios_error.response) {
      const error_data = axios_error.response.data as any;
      const api_error_message =
        error_data?.error?.message || 'Error tidak diketahui dari YouTube API.';
      const error_status =
        axios_error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      this.logger.error(
        `Error dari YouTube API saat ${action} (Status: ${error_status}): ${api_error_message}`,
        JSON.stringify(error_data.error?.errors),
      );
      throw new HttpException(api_error_message, error_status);
    } else if (axios_error.request) {
      this.logger.error(
        `Tidak ada respons dari YouTube API saat ${action}:`,
        axios_error.message,
      );
      throw new HttpException(
        'Tidak ada respons dari layanan YouTube.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      this.logger.error(
        `Error saat menyiapkan permintaan ke YouTube API untuk ${action}:`,
        axios_error.message,
      );
      throw new HttpException(
        `Gagal menghubungi layanan YouTube: ${axios_error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Mentransformasi item dari hasil pencarian YouTube API ke format DTO,
   * diperkaya dengan detail video dari panggilan API terpisah.
   * @param search_api_item Item mentah dari API pencarian.
   * @param video_api_item Item mentah detail video dari API video (bisa undefined).
   * @returns Objek SearchVideoItemDto.
   * @private
   */
  private _transform_search_item(
    search_api_item: any,
    video_api_item?: any,
  ): SearchVideoItemDto {
    const search_snippet = search_api_item.snippet;
    // Prioritaskan data dari video_api_item jika ada, karena mungkin lebih baru/lengkap
    const effective_snippet = video_api_item?.snippet || search_snippet;
    const statistics = video_api_item?.statistics;
    const content_details = video_api_item?.contentDetails;

    const view_count = statistics?.viewCount
      ? parseInt(statistics.viewCount, 10)
      : null;
    const published_at_string = effective_snippet?.publishedAt;
    const published_at_moment = published_at_string
      ? moment.utc(published_at_string)
      : null;

    let hours_since_published = 0;
    if (published_at_moment && published_at_moment.isValid()) {
      hours_since_published = moment
        .utc()
        .diff(published_at_moment, 'hours', true);
    }

    let vph = null;
    if (view_count !== null && hours_since_published > 0) {
      vph = view_count / hours_since_published;
    }

    const like_count_raw = statistics?.likeCount;

    return {
      video_id: search_api_item.id.videoId,
      published_at: published_at_string,
      channel_id: effective_snippet?.channelId,
      title: effective_snippet?.title,
      description: effective_snippet?.description, // Deskripsi dari snippet pencarian mungkin lebih relevan dengan query
      thumbnail_default_url: effective_snippet?.thumbnails?.default?.url,
      thumbnail_medium_url: effective_snippet?.thumbnails?.medium?.url,
      thumbnail_high_url: effective_snippet?.thumbnails?.high?.url,
      channel_title: effective_snippet?.channelTitle,
      live_broadcast_content: search_snippet?.liveBroadcastContent, // liveBroadcastContent dari snippet pencarian

      // Fields tambahan
      view_count: view_count,
      like_count: like_count_raw ? parseInt(like_count_raw, 10) : null,
      comment_count: statistics?.commentCount
        ? parseInt(statistics.commentCount, 10)
        : null,
      duration: content_details?.duration || null,
      vph: vph !== null ? parseFloat(vph.toFixed(2)) : null,
      formatted_view_count:
        view_count !== null ? this._format_number(view_count) : null,
      formatted_like_count: like_count_raw
        ? this._format_number(parseInt(like_count_raw, 10))
        : null,
      formatted_vph: vph !== null ? `${this._format_number(vph)}/hr` : null,
      time_since_upload:
        published_at_moment && published_at_moment.isValid()
          ? published_at_moment.fromNow()
          : 'N/A',
      formatted_duration: content_details?.duration
        ? this._format_yt_duration(content_details.duration)
        : null,
      tags: effective_snippet?.tags || [], // Tambahkan ini
    };
  }
}
