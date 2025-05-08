/**
 * DTO untuk merepresentasikan satu item video dari hasil pencarian YouTube.
 * Informasi ini umumnya berasal dari bagian 'snippet' dari respons API pencarian,
 * dan diperkaya dengan detail dari panggilan API video terpisah.
 */
export class SearchVideoItemDto {
  video_id: string;
  published_at: string;
  channel_id: string;
  title: string;
  description: string;
  thumbnail_default_url: string;
  thumbnail_medium_url: string;
  thumbnail_high_url: string;
  channel_title: string;
  live_broadcast_content: string; // 'live', 'upcoming', atau 'none'

  // Fields tambahan untuk menyamai TrendingVideoItemDto
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  duration: string | null; // Durasi dari contentDetails
  vph: number | null;
  formatted_view_count: string | null;
  formatted_like_count: string | null;
  formatted_vph: string | null;
  time_since_upload: string | null;
  formatted_duration: string | null;
  tags: string[];
}
