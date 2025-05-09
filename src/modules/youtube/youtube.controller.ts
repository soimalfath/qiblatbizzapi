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
// import { ResponseHelper } from 'src/utils/response.helper';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly _youtubeService: YoutubeService) {}

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
  async getTrendingVideos(
    @Query() queryParams: GetTrendingVideosDto,
  ): Promise<TrendingVideosResponseDto> {
    return this._youtubeService.getTrendingVideos(queryParams);
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
  async searchVideos(
    @Query() queryParams: SearchVideosDto,
  ): Promise<SearchVideosResponseDto> {
    return this._youtubeService.searchVideos(queryParams);
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
  async getVideoDetails(
    @Param() params: GetVideoDetailsParamsDto,
  ): Promise<TrendingVideoItemDto> {
    return this._youtubeService.getVideoDetails(params.video_id);
  }
}
