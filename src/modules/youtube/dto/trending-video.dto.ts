/**
 * DTO untuk merepresentasikan satu item video trending.
 */
export class TrendingVideoItemDto {
  id: string;
  title: string;
  thumbnail_url: string;
  medium_thumbnail_url: string;
  high_thumbnail_url: string;
  channel_title: string;
  channel_id: string;
  view_count: number;
  like_count: number | null;
  comment_count: number | null;
  published_at: string;
  duration: string;
  vph: number;
  formatted_view_count: string;
  formatted_like_count: string | null;
  formatted_vph: string;
  time_since_upload: string;
  formatted_duration: string;
  tags: string[];
}

/**
 * DTO untuk respons daftar video trending, termasuk informasi paginasi.
 */
export class TrendingVideosResponseDto {
  items: TrendingVideoItemDto[];
  next_page_token?: string;
  prev_page_token?: string;
  page_info: {
    total_results: number;
    results_per_page: number;
  };
}
