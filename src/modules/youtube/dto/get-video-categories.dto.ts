import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * @class GetVideoCategoriesDto
 * @description DTO for requesting video categories from YouTube.
 */
export class GetVideoCategoriesDto {
  @IsNotEmpty()
  @IsString()
  regionCode: string;

  @IsOptional()
  @IsString()
  hl?: string;
}
