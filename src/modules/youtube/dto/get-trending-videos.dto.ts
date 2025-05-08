import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer'; // Import Type

/**
 * DTO untuk query parameter saat mengambil video trending YouTube.
 */
export class GetTrendingVideosDto {
  @IsOptional()
  @IsString()
  region_code?: string = 'ID';

  @IsOptional()
  @IsString()
  video_category_id?: string = '0';

  @IsOptional()
  @Type(() => Number) // Ensures transformation from string to number
  @IsInt() // Ensures the value is an integer
  @Min(1) // Ensures the value is at least 1
  @Max(50) // Ensures the value is at most 50
  max_results?: number = 10;

  @IsOptional()
  @IsString()
  page_token?: string;

  @IsOptional()
  @IsString()
  hl?: string = 'id'; // Bahasa untuk metadata
}
