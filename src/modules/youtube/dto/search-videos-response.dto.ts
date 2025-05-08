import { SearchVideoItemDto } from './search-video-item.dto';

/**
 * DTO untuk struktur data halaman informasi.
 */
class PageInfoDto {
  total_results: number;
  results_per_page: number;
}

/**
 * DTO untuk respons daftar video hasil pencarian YouTube, termasuk informasi paginasi.
 */
export class SearchVideosResponseDto {
  items: SearchVideoItemDto[];
  next_page_token?: string;
  prev_page_token?: string; // YouTube API search list tidak menyediakan prevPageToken secara default
  region_code?: string;
  page_info: PageInfoDto;
  tags?: string[];
}
