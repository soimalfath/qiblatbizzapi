import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer'; // Import Type

export class GetTrendingVideosDto {
  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsString()
  videoCategoryId?: string;

  @IsOptional()
  @Type(() => Number) // Ensures transformation from string to number
  @IsInt() // Ensures the value is an integer
  @Min(1) // Ensures the value is at least 1
  @Max(50) // Ensures the value is at most 50
  maxResults?: number = 10;

  @IsOptional()
  @IsString()
  pageToken?: string;

  @IsOptional()
  @IsString()
  hl?: string;
}
