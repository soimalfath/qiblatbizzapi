import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Param, // Tambahkan Param
} from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { GetTrendingVideosDto } from './dto/get-trending-videos.dto';
import {
  TrendingVideosResponseDto,
  TrendingVideoItemDto,
} from './dto/trending-video.dto'; // Tambahkan TrendingVideoItemDto
import { SearchVideosDto } from './dto/search-videos.dto';
import { SearchVideosResponseDto } from './dto/search-videos-response.dto';
import { GetVideoDetailsParamsDto } from './dto/get-video-details-params.dto'; // Tambahkan DTO baru

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtube_service: YoutubeService) {}

  /**
   * Endpoint untuk mendapatkan daftar video trending dari YouTube.
   * @param query_params Parameter untuk filter dan paginasi.
   * @returns Daftar video trending.
   */
  @Get('trending')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async get_trending_videos(
    @Query() query_params: GetTrendingVideosDto,
  ): Promise<TrendingVideosResponseDto> {
    return this.youtube_service.get_trending_videos(query_params);
  }

  /**
   * Endpoint untuk mencari video di YouTube berdasarkan kata kunci.
   * @param query_params Parameter untuk pencarian, filter, dan paginasi.
   * @returns Daftar video hasil pencarian.
   */
  @Get('search')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async search_videos(
    @Query() query_params: SearchVideosDto,
  ): Promise<SearchVideosResponseDto> {
    return this.youtube_service.search_videos(query_params);
  }

  /**
   * Endpoint untuk mendapatkan detail video spesifik berdasarkan ID.
   * @param params Parameter path yang berisi video_id.
   * @returns Detail video.
   */
  @Get('video/:video_id') // video_id harus cocok dengan nama properti di GetVideoDetailsParamsDto
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async get_video_details(
    @Param() params: GetVideoDetailsParamsDto,
  ): Promise<TrendingVideoItemDto> {
    return this.youtube_service.get_video_details(params.video_id);
  }
}
