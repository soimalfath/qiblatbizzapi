import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * @enum {string}
 * @description Urutan hasil pencarian YouTube.
 * - `date` – Urutkan sumber daya dalam urutan kronologis terbalik berdasarkan tanggal pembuatannya.
 * - `rating` – Urutkan sumber daya dari peringkat tertinggi ke terendah.
 * - `relevance` – Urutkan sumber daya berdasarkan relevansinya dengan istilah pencarian. Ini adalah nilai default untuk parameter ini.
 * - `title` – Urutkan sumber daya dalam urutan abjad berdasarkan judulnya.
 * - `videoCount` – Urutkan saluran dalam urutan menurun berdasarkan jumlah video yang diunggahnya.
 * - `viewCount` – Urutkan sumber daya dari yang paling banyak dilihat hingga yang paling sedikit dilihat.
 */
export enum EYoutubeSearchOrder {
  DATE = 'date',
  RATING = 'rating',
  RELEVANCE = 'relevance',
  TITLE = 'title',
  VIDEO_COUNT = 'videoCount',
  VIEW_COUNT = 'viewCount',
}

/**
 * DTO untuk query parameter saat melakukan pencarian video di YouTube.
 */
export class SearchVideosDto {
  /**
   * @description Istilah pencarian.
   * @example "berita terbaru"
   */
  @IsString()
  @IsNotEmpty()
  q: string;

  /**
   * @description Menentukan metode pengurutan hasil pencarian.
   * @default YoutubeSearchOrder.RELEVANCE
   */
  @IsOptional()
  @IsIn(Object.values(EYoutubeSearchOrder))
  order?: EYoutubeSearchOrder = EYoutubeSearchOrder.RELEVANCE;

  /**
   * @description Jumlah maksimum hasil yang akan dikembalikan.
   * @default 10
   * @minimum 1
   * @maximum 50
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  max_results?: number = 10;

  /**
   * @description Token untuk halaman hasil berikutnya.
   */
  @IsOptional()
  @IsString()
  page_token?: string;

  /**
   * @description Kode wilayah untuk memfilter hasil pencarian.
   * @example "ID"
   */
  @IsOptional()
  @IsString()
  region_code?: string;

  /**
   * @description Bahasa untuk metadata dalam respons.
   * @default "id"
   * @example "en"
   */
  @IsOptional()
  @IsString()
  hl?: string = 'id';

  /**
   * @description Membatasi pencarian hanya untuk jenis sumber daya tertentu.
   * @default "video"
   */
  @IsOptional()
  @IsString()
  type?: string = 'video'; // Biasanya 'video', bisa juga 'channel', 'playlist'
}
