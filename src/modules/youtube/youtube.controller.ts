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
import { GetVideoCategoriesDto } from './dto/get-video-categories.dto'; // Import DTO
import { VideoCategoriesResponseDto } from './dto/video-category.dto'; // Import DTO
import { GetChannelDetailsParamsDto } from './dto/get-channel-details-params.dto'; // <-- Tambahkan impor ini
import { ChannelDetailsDto } from './dto/channel-details.dto'; // <-- Tambahkan impor ini

/**
 * @class YoutubeController
 * @description Controller for handling YouTube related API requests.
 */
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

  /**
   * @method getChannelDetails
   * @description Endpoint untuk mendapatkan detail channel YouTube berdasarkan ID.
   * @param {GetChannelDetailsParamsDto} params - Parameter path yang berisi channel_id.
   * @param {string} hl - Query parameter untuk bahasa (opsional).
   * @returns {Promise<ChannelDetailsDto>} Detail channel.
   */
  @Get('channel/:channel_id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async getChannelDetails(
    @Param() params: GetChannelDetailsParamsDto,
    @Query('hl') hl?: string, // Ambil 'hl' dari query parameter
  ): Promise<ChannelDetailsDto> {
    return this._youtubeService.getChannelDetails(params.channel_id, hl);
  }

  /**
   * @method getVideoCategories
   * @description Endpoint to get a list of YouTube video categories for a specific region.
   * @param {GetVideoCategoriesDto} queryParams - Parameters for fetching video categories (regionCode, hl).
   * @returns {Promise<VideoCategoriesResponseDto>} A list of video categories.
   */
  @Get('categories')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async getVideoCategories(
    @Query() queryParams: GetVideoCategoriesDto,
  ): Promise<VideoCategoriesResponseDto> {
    // No need for ResponseHelper here if we are returning the DTO directly
    // and relying on NestJS's built-in serialization and error handling.
    // If custom error/success wrapping is strictly required by project standards,
    // then ResponseHelper could be used similarly to other endpoints.
    return this._youtubeService.getVideoCategories(queryParams);
  }
}
