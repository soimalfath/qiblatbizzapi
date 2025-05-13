// import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsUrl,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';

/**
 * @class ChannelThumbnailDto
 * @description DTO untuk thumbnail channel.
 */
class ChannelThumbnailDto {
  // @ApiProperty({ description: 'URL thumbnail.', example: 'https://yt3.ggpht.com/...' })
  @IsUrl()
  url: string;

  // @ApiProperty({ description: 'Lebar thumbnail dalam piksel.', example: 88 })
  @IsNumber()
  width: number;

  // @ApiProperty({ description: 'Tinggi thumbnail dalam piksel.', example: 88 })
  @IsNumber()
  height: number;
}

/**
 * @class ChannelThumbnailsDto
 * @description DTO untuk berbagai ukuran thumbnail channel.
 */
class ChannelThumbnailsDto {
  // @ApiProperty({
  //   type: ChannelThumbnailDto,
  //   description: 'Thumbnail ukuran default.',
  // })
  @ValidateNested()
  @Type(() => ChannelThumbnailDto)
  default: ChannelThumbnailDto;

  // @ApiProperty({
  //   type: ChannelThumbnailDto,
  //   description: 'Thumbnail ukuran sedang.',
  // })
  @ValidateNested()
  @Type(() => ChannelThumbnailDto)
  medium: ChannelThumbnailDto;

  // @ApiProperty({
  //   type: ChannelThumbnailDto,
  //   description: 'Thumbnail ukuran tinggi.',
  // })
  @ValidateNested()
  @Type(() => ChannelThumbnailDto)
  high: ChannelThumbnailDto;
}

/**
 * @class ChannelSnippetDto
 * @description DTO untuk snippet detail channel.
 */
class ChannelSnippetDto {
  // @ApiProperty({ description: 'Judul channel.', example: 'YouTube' })
  @IsString()
  title: string;

  // @ApiProperty({
  //   description: 'Deskripsi channel.',
  //   example: 'Share your videos with friends, family, and the world.',
  // })
  @IsString()
  description: string;

  // @ApiProperty({
  //   description: 'URL kustom channel (jika ada).',
  //   example: 'youtube',
  //   required: false,
  // })
  @IsOptional()
  @IsString()
  customUrl?: string;

  // @ApiProperty({
  //   description: 'Tanggal dan waktu channel dipublikasikan (ISO 8601).',
  //   example: '2005-02-14T00:00:00Z',
  // })
  @IsDateString()
  publishedAt: string;

  // @ApiProperty({
  //   type: ChannelThumbnailsDto,
  //   description: 'Thumbnails channel.',
  // })
  @ValidateNested()
  @Type(() => ChannelThumbnailsDto)
  thumbnails: ChannelThumbnailsDto;

  // @ApiProperty({
  //   description: 'Judul channel yang dilokalkan.',
  //   example: 'YouTube',
  //   required: false,
  // })
  @IsOptional()
  @IsString()
  localizedTitle?: string; // Dari localized.title

  // @ApiProperty({
  //   description: 'Deskripsi channel yang dilokalkan.',
  //   example: 'Bagikan video Anda dengan teman, keluarga, dan dunia.',
  //   required: false,
  // })
  @IsOptional()
  @IsString()
  localizedDescription?: string; // Dari localized.description

  // @ApiProperty({
  //   description: 'Kode negara channel (ISO 3166-1 alpha-2).',
  //   example: 'US',
  //   required: false,
  // })
  @IsOptional()
  @IsString()
  country?: string;
}

/**
 * @class ChannelStatisticsDto
 * @description DTO untuk statistik channel.
 */
class ChannelStatisticsDto {
  // @ApiProperty({
  //   description: 'Jumlah total penayangan channel.',
  //   example: '1000000000',
  // })
  @IsString() // YouTube API mengembalikan ini sebagai string
  viewCount: string;

  // @ApiProperty({
  //   description: 'Jumlah subscriber channel (bisa null jika disembunyikan).',
  //   example: '1000000',
  //   required: false,
  //   nullable: true,
  // })
  @IsOptional()
  @IsString()
  subscriberCount?: string | null;

  // @ApiProperty({
  //   description: 'Apakah jumlah subscriber disembunyikan.',
  //   example: false,
  // })
  @IsBoolean()
  hiddenSubscriberCount: boolean;

  // @ApiProperty({
  //   description: 'Jumlah total video yang diunggah ke channel.',
  //   example: '500',
  // })
  @IsString() // YouTube API mengembalikan ini sebagai string
  videoCount: string;
}

/**
 * @class ChannelBrandingSettingsImageDto
 * @description DTO untuk gambar branding channel.
 */
class ChannelBrandingSettingsImageDto {
  // @ApiProperty({
  //   description: 'URL eksternal untuk banner channel.',
  //   example: 'https://yt3.ggpht.com/...',
  //   required: false,
  // })
  @IsOptional()
  @IsUrl()
  bannerExternalUrl?: string;
}

/**
 * @class ChannelBrandingSettingsDto
 * @description DTO untuk pengaturan branding channel.
 */
class ChannelBrandingSettingsDto {
  // @ApiProperty({
  //   type: ChannelBrandingSettingsImageDto,
  //   description: 'Pengaturan gambar branding.',
  //   required: false,
  // })
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelBrandingSettingsImageDto)
  image?: ChannelBrandingSettingsImageDto;

  // Bisa ditambahkan properti lain dari channel.brandingSettings.channel jika diperlukan
}

/**
 * @class ChannelDetailsDto
 * @description DTO untuk detail lengkap sebuah channel YouTube.
 */
export class ChannelDetailsDto {
  // @ApiProperty({ description: 'Jenis resource, contoh: "youtube#channel".' })
  @IsString()
  kind: string;

  // @ApiProperty({ description: 'ETag dari resource.' })
  @IsString()
  etag: string;

  // @ApiProperty({ description: 'ID unik channel.' })
  @IsString()
  id: string;

  // @ApiProperty({
  //   type: ChannelSnippetDto,
  //   description: 'Snippet detail channel.',
  // })
  @ValidateNested()
  @Type(() => ChannelSnippetDto)
  snippet: ChannelSnippetDto;

  // @ApiProperty({
  //   type: ChannelStatisticsDto,
  //   description: 'Statistik channel.',
  // })
  @ValidateNested()
  @Type(() => ChannelStatisticsDto)
  statistics: ChannelStatisticsDto;

  // @ApiProperty({
  //   type: ChannelBrandingSettingsDto,
  //   description: 'Pengaturan branding channel.',
  //   required: false,
  // })
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelBrandingSettingsDto)
  brandingSettings?: ChannelBrandingSettingsDto;

  // Bisa ditambahkan contentDetails jika diperlukan
}

/**
 * @class ChannelListResponseDto
 * @description DTO untuk respons daftar channel dari YouTube API (biasanya berisi satu item untuk get by ID).
 */
export class ChannelListResponseDto {
  // @ApiProperty({
  //   description: 'Jenis resource, contoh: "youtube#channelListResponse".',
  // })
  @IsString()
  kind: string;

  // @ApiProperty({ description: 'ETag dari respons.' })
  @IsString()
  etag: string;

  // @ApiProperty({
  //   type: [ChannelDetailsDto],
  //   description:
  //     'Daftar channel (akan berisi satu channel saat mengambil berdasarkan ID).',
  // })
  @ValidateNested({ each: true })
  @Type(() => ChannelDetailsDto)
  items: ChannelDetailsDto[];

  // pageInfo tidak relevan saat mengambil berdasarkan ID tunggal
}
