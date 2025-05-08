import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO untuk parameter path saat mengambil detail video.
 */
export class GetVideoDetailsParamsDto {
  /**
   * @description ID unik dari video YouTube.
   * @example "dQw4w9WgXcQ"
   */
  @IsString()
  @IsNotEmpty()
  video_id: string;
}
