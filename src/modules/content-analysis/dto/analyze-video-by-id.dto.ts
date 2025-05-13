// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * @class AnalyzeVideoByIdRequestDto
 * @description DTO untuk permintaan analisis video berdasarkan ID.
 */
export class AnalyzeVideoByIdRequestDto {
  // @ApiProperty({
  //   description: 'ID Video YouTube yang akan dianalisis.',
  //   example: 'dQw4w9WgXcQ',
  // })
  @IsString()
  video_id: string;

  // @ApiPropertyOptional({
  //   description: 'Kode bahasa untuk respons AI (ISO 639-1).',
  //   example: 'id',
  //   default: 'id',
  // })
  @IsOptional()
  @IsString()
  hl?: string = 'id';
}

/**
 * @class SeoOptimizationTipsDto
 * @description DTO untuk saran optimasi SEO.
 */
export class SeoOptimizationTipsDto {
  // @ApiProperty({
  //   description: 'Saran untuk judul video.',
  //   example: [
  //     'Pastikan judul menarik dan mengandung kata kunci utama.',
  //     'Optimalnya, panjang judul antara 60-70 karakter.',
  //   ],
  //   type: [String],
  // })
  @IsArray()
  @IsString({ each: true })
  title_suggestions: string[];

  // @ApiProperty({
  //   description: 'Saran untuk deskripsi video.',
  //   example: [
  //     'Sertakan kata kunci relevan di awal deskripsi.',
  //     'Tulis deskripsi yang informatif minimal 200 kata.',
  //   ],
  //   type: [String],
  // })
  @IsArray()
  @IsString({ each: true })
  description_suggestions: string[];

  // @ApiProperty({
  //   description: 'Saran untuk tag video.',
  //   example: [
  //     'Gunakan campuran tag umum dan spesifik.',
  //     'Manfaatkan semua ruang tag yang tersedia.',
  //   ],
  //   type: [String],
  // })
  @IsArray()
  @IsString({ each: true })
  tag_suggestions: string[];
}

/**
 * @class ThumbnailFeedbackDto
 * @description DTO untuk umpan balik thumbnail.
 */
export class ThumbnailFeedbackDto {
  // @ApiProperty({
  //   description: 'Saran umum untuk perbaikan thumbnail.',
  //   example: [
  //     'Gunakan gambar resolusi tinggi (1280x720).',
  //     'Pastikan thumbnail terlihat jelas di berbagai ukuran layar.',
  //     'Tampilkan emosi atau elemen yang membuat penasaran.',
  //   ],
  //   type: [String],
  // })
  @IsArray()
  @IsString({ each: true })
  general_suggestions: string[];
}

/**
 * @class CallToActionIdeasDto
 * @description DTO untuk ide Call to Action (CTA).
 */
export class CallToActionIdeasDto {
  // @ApiProperty({
  //   description: 'Contoh ide CTA untuk disertakan dalam video atau deskripsi.',
  //   example: [
  //     'Jangan lupa subscribe dan nyalakan lonceng notifikasi!',
  //     'Komentar di bawah, video apa yang ingin kamu lihat selanjutnya?',
  //     'Bagikan video ini ke temanmu jika bermanfaat!',
  //   ],
  //   type: [String],
  // })
  @IsArray()
  @IsString({ each: true })
  ideas: string[];
}

/**
 * @class EngagementBoostersDto
 * @description DTO untuk ide peningkat engagement.
 */
export class EngagementBoostersDto {
  // @ApiProperty({
  //   description: 'Saran untuk meningkatkan interaksi dengan penonton.',
  //   example: [
  //     'Ajukan pertanyaan di akhir video untuk memancing komentar.',
  //     'Buat polling di tab komunitas.',
  //     'Sematkan komentar terbaik dari penonton.',
  //   ],
  //   type: [String],
  // })
  @IsArray()
  @IsString({ each: true })
  strategies: string[];
}

/**
 * @class AnalyzeVideoByIdResponseDto
 * @description DTO untuk respons analisis video berdasarkan ID.
 */
export class AnalyzeVideoByIdResponseDto {
  // @ApiProperty({ description: 'ID Video YouTube.', example: 'dQw4w9WgXcQ' })
  @IsString()
  video_id: string;

  // @ApiProperty({
  //   description: 'Judul video yang dianalisis.',
  //   example: 'Video Populer Saya',
  // })
  @IsString()
  title: string;

  // @ApiProperty({
  //   description: 'Ringkasan deskripsi video (dihasilkan AI).',
  //   example:
  //     'Video ini adalah tutorial memasak nasi goreng spesial dengan bumbu rahasia.',
  // })
  @IsString()
  description_summary: string;

  // @ApiProperty({
  //   description: 'Kata kunci yang teridentifikasi dari video (dihasilkan AI).',
  //   example: ['tutorial memasak', 'nasi goreng', 'resep spesial'],
  //   type: [String],
  // })
  @IsArray()
  @IsString({ each: true })
  identified_keywords: string[];

  // @ApiProperty({
  //   description: 'Saran sudut pandang atau topik turunan (dihasilkan AI).',
  //   example:
  //     'Buat video variasi nasi goreng lain atau tantangan memasak nasi goreng tercepat.',
  // })
  @IsString()
  suggested_angle: string;

  // @ApiProperty({ description: 'Saran optimasi SEO.' })
  @ValidateNested()
  @Type(() => SeoOptimizationTipsDto)
  seo_tips: SeoOptimizationTipsDto;

  // @ApiProperty({ description: 'Umpan balik dan saran untuk thumbnail.' })
  @ValidateNested()
  @Type(() => ThumbnailFeedbackDto)
  thumbnail_feedback: ThumbnailFeedbackDto;

  // @ApiProperty({ description: 'Ide-ide Call to Action (CTA).' })
  @ValidateNested()
  @Type(() => CallToActionIdeasDto)
  cta_ideas: CallToActionIdeasDto;

  // @ApiProperty({ description: 'Strategi untuk meningkatkan engagement.' })
  @ValidateNested()
  @Type(() => EngagementBoostersDto)
  engagement_boosters: EngagementBoostersDto;
}
