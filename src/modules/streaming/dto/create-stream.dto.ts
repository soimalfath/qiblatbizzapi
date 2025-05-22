import { IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';

/**
 * @class CreateStreamDto
 * @description DTO untuk membuat sesi streaming baru.
 */
export class CreateStreamDto {
  @IsString()
  videoSource: string;

  @IsUrl()
  rtmpUrl: string;

  @IsOptional()
  @IsBoolean()
  loop?: boolean;
}
