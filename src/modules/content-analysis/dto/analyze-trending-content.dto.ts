// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * @class AnalyzeTrendingContentRequestDto
 * @description DTO untuk permintaan analisis tren konten cerdas.
 */
export class AnalyzeTrendingContentRequestDto {
  // @ApiPropertyOptional({
  //   description: 'ID Kategori video untuk filter tren (opsional).',
  //   example: '10', // Musik
  // })
  @IsOptional()
  @IsString()
  category_id?: string;

  // @ApiPropertyOptional({
  //   description:
  //     'Kata kunci untuk memandu analisis atau pencarian sekunder (opsional).',
  //   example: 'tutorial memasak',
  // })
  @IsOptional()
  @IsString()
  keywords?: string;

  // @ApiPropertyOptional({
  //   description: 'Kode wilayah untuk video trending (ISO 3166-1 alpha-2).',
  //   example: 'ID',
  //   default: 'ID',
  // })
  @IsOptional()
  @IsString()
  region_code?: string = 'ID';

  // @ApiPropertyOptional({
  //   description: 'Jumlah maksimum video trending yang akan dianalisis.',
  //   example: 10,
  //   default: 10,
  //   minimum: 1,
  //   maximum: 50,
  // })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  max_results?: number = 10;

  // @ApiPropertyOptional({
  //   description: 'Kode bahasa untuk respons (ISO 639-1).',
  //   example: 'id',
  //   default: 'id',
  // })
  @IsOptional()
  @IsString()
  hl?: string = 'id';
}

/**
 * @class AnalyzedVideoTrendDto
 * @description DTO untuk detail tren video yang telah dianalisis.
 */
export class AnalyzedVideoTrendDto {
  // @ApiProperty({ description: 'ID Video YouTube.', example: 'dQw4w9WgXcQ' })
  @IsString()
  video_id: string;

  // @ApiProperty({
  //   description: 'Judul video.',
  //   example: 'Video Musik Populer',
  // })
  @IsString()
  title: string;

  // @ApiPropertyOptional({
  //   description: 'URL thumbnail default video.',
  //   example: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg',
  // })
  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  // @ApiPropertyOptional({
  //   description: 'Judul channel.',
  //   example: 'Official Channel',
  // })
  @IsOptional()
  @IsString()
  channel_title?: string;

  // @ApiProperty({
  //   description: 'Jumlah penayangan video.',
  //   example: 1000000,
  // })
  @IsNumber()
  view_count: number;

  // @ApiProperty({
  //   description: 'Tanggal publikasi video (ISO 8601).',
  //   example: '2023-01-15T10:00:00Z',
  // })
  @IsString()
  published_at: string;

  // @ApiProperty({
  //   description: 'Ringkasan deskripsi video (dihasilkan AI).',
  //   example: 'Video ini adalah tentang musik pop yang sedang tren...',
  // })
  @IsString()
  description_summary: string;

  // @ApiProperty({
  //   description: 'Kata kunci yang teridentifikasi dari video (dihasilkan AI).',
  //   example: ['musik', 'pop', 'tren'],
  //   type: [String],
  // })
  @IsArray()
  @IsString({ each: true })
  identified_keywords: string[];

  // @ApiProperty({
  //   description: 'Saran sudut pandang atau topik turunan (dihasilkan AI).',
  //   example: 'Buat konten reaksi terhadap video ini atau analisis liriknya.',
  // })
  @IsString()
  suggested_angle: string;
}

/**
 * @class AnalyzeTrendingContentResponseDto
 * @description DTO untuk respons analisis tren konten cerdas.
 */
export class AnalyzeTrendingContentResponseDto {
  // @ApiProperty({
  //   description: 'Daftar tren video yang telah dianalisis.',
  //   type: [AnalyzedVideoTrendDto],
  // })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnalyzedVideoTrendDto)
  analyzed_trends: AnalyzedVideoTrendDto[];

  // @ApiProperty({
  //   description: 'Ringkasan umum tren saat ini (dihasilkan AI).',
  //   example:
  //     'Tren saat ini didominasi oleh konten musik dan tantangan viral...',
  // })
  @IsString()
  overall_summary: string;

  // @ApiProperty({
  //   description:
  //     'Saran topik konten baru berdasarkan analisis tren (dihasilkan AI).',
  //   example: ['Buat video tantangan X', 'Tutorial Y yang sedang populer'],
  //   type: [String],
  // })
  @IsArray()
  @IsString({ each: true })
  suggested_topics: string[];
}
