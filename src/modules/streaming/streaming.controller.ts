import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { ResponseHelper } from '../../utils/response.helper';
import { CreateStreamDto } from './dto/create-stream.dto'; // Import DTO

/**
 * @class StreamingController
 * @description Controller untuk menangani permintaan terkait streaming video.
 */
@Controller('streaming')
export class StreamingController {
  constructor(private readonly _streamingService: StreamingService) {} // Menggunakan leading underscore untuk private member

  /**
   * @route POST /streaming/start
   * @description Memulai sesi streaming baru.
   * @param {any} createStreamDto - Data untuk memulai stream (nantinya ganti dengan DTO yang sesuai).
   * @returns {Promise<any>} Hasil dari operasi memulai stream.
   */
  @Post('start')
  async startStream(@Body() createStreamDto: CreateStreamDto) {
    // Gunakan DTO di sini
    try {
      const result = await this._streamingService.startStream(createStreamDto);
      return ResponseHelper.success('Stream started successfully', result);
    } catch (error) {
      return ResponseHelper.handleError(error);
    }
  }

  /**
   * @route POST /streaming/stop/:streamId
   * @description Menghentikan sesi streaming berdasarkan ID.
   * @param {string} streamId - ID dari stream yang akan dihentikan.
   * @returns {Promise<any>} Hasil dari operasi menghentikan stream.
   */
  @Post('stop/:streamId')
  async stopStream(@Param('streamId') streamId: string) {
    try {
      // const result = await this._streamingService.stopStream(streamId);
      // return ResponseHelper.success('Stream stopped successfully', result);
      return ResponseHelper.success('Endpoint to stop stream', { streamId });
    } catch (error) {
      return ResponseHelper.handleError(error);
    }
  }

  /**
   * @route GET /streaming/status/:streamId
   * @description Mendapatkan status sesi streaming berdasarkan ID.
   * @param {string} streamId - ID dari stream yang statusnya ingin diketahui.
   * @returns {Promise<any>} Status dari stream.
   */
  @Get('status/:streamId')
  async getStreamStatus(@Param('streamId') streamId: string) {
    try {
      // const result = await this._streamingService.getStreamStatus(streamId);
      // return ResponseHelper.success('Stream status retrieved successfully', result);
      return ResponseHelper.success('Endpoint to get stream status', {
        streamId,
      });
    } catch (error) {
      return ResponseHelper.handleError(error);
    }
  }
}
