import {
  Controller,
  Post,
  Get, // <-- Tambahkan Get
  Res,
  Body,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { Response, Request } from 'express';
import { ResponseHelper } from '../../utils/response.helper';
import { lastValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from '../products/products.service';
import { GenerateCopywriting } from './dto/create-ai.dto';
import { prompt } from '../../helper/prompt';
import { UserEntity } from '../users/entities/user.entity';
import { CreateYoutubeContentDto } from './dto/create-youtube-content.dto';
import { GenerateSpeechDto } from './dto/generate-speech.dto';
// import { promises } from 'dns'; // Hapus jika tidak digunakan

@Controller('ai')
export class AiController {
  private readonly _logger = new Logger(AiController.name); // <-- Inisialisasi Logger

  constructor(
    private readonly _aiService: AiService,
    private readonly _productService: ProductsService, // Tetap inject jika masih dipakai di method lain
  ) {}

  /**
   * Endpoint untuk menghasilkan copywriting produk.
   * Memerlukan autentikasi JWT.
   * @param generateCopywriting DTO berisi productId dan type copywriting.
   * @param res Objek Response Express.
   * @param req Objek Request Express.
   * @returns JSON response menggunakan ResponseHelper.
   */
  @Post('copywriting')
  @UseGuards(JwtAuthGuard) // Guard diletakkan di sini
  async generateCopyWriting(
    @Body() generateCopywriting: GenerateCopywriting,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user = req.user as UserEntity;
      const productId = generateCopywriting.productId; // Gunakan snake_case jika diinginkan, tapi DTO pakai camelCase
      const userId = user.id;
      const type = generateCopywriting.type;
      const product = await this._productService.findOne(+productId, userId);
      const prompting = prompt(
        type,
        product.description,
        product.name,
        product.categories,
      );
      const data = await lastValueFrom(
        this._aiService.generateCopyWriting(prompting),
      );
      // Menggunakan ResponseHelper untuk sukses
      return res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success('Success generate copywriting', data));
    } catch (error) {
      // Menggunakan ResponseHelper untuk error
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof HttpException
          ? error.message
          : 'Internal server error';
      // Kirim respons error menggunakan ResponseHelper
      return res.status(status).json(ResponseHelper.error(message, status));
    }
  }

  /**
   * Endpoint untuk menghasilkan konten YouTube lengkap.
   * Memerlukan autentikasi JWT dan role tertentu (opsional).
   * @param createYoutubeContentDto DTO berisi detail permintaan konten YouTube.
   * @param res Objek Response Express.
   * @param req Objek Request Express (untuk info user jika perlu).
   * @returns JSON response menggunakan ResponseHelper.
   */
  @Post('youtube-content/generate')
  // @UseGuards(JwtAuthGuard, RolesGuard) // Tambahkan RolesGuard jika perlu pembatasan role
  // @Roles(Role.ADMIN, Role.USER) // Tentukan role yang diizinkan (sesuaikan)
  async generateYoutubeContent(
    @Body() createYoutubeContentDto: CreateYoutubeContentDto,
    @Res() res: Response,
    // @Req() req: Request, // req bisa digunakan jika perlu info user
  ) {
    try {
      // const user = req.user as UserEntity; // Uncomment jika perlu info user
      const generatedContent = await this._aiService.generateYoutubeContent(
        createYoutubeContentDto,
      );

      // Menggunakan ResponseHelper untuk sukses
      return res.status(HttpStatus.OK).json(
        ResponseHelper.success(
          'Success generate YouTube content',
          generatedContent, // Pastikan ini adalah objek yang diharapkan
        ),
      );
    } catch (error) {
      // Menggunakan ResponseHelper untuk error
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof HttpException
          ? error.message
          : 'Internal server error';

      // <-- Tambahkan log error di sini juga
      this._logger.error(
        `Error di generate_youtube_content: ${message}`,
        error.stack,
      );

      // Kirim respons error menggunakan ResponseHelper
      return res.status(status).json(ResponseHelper.error(message, status));
    }
  }

  /**
   * Endpoint untuk menghasilkan audio dari teks menggunakan ElevenLabs.
   * Memerlukan autentikasi JWT.
   * @param generateSpeechDto DTO berisi teks dan konfigurasi suara opsional.
   * @param res Objek Response Express untuk mengirim audio.
   * @returns Streaming audio atau JSON response error.
   */
  @Post('text-to-speech/elevenlabs')
  @UseGuards(JwtAuthGuard)
  async generateSpeechFromText(
    @Body() generateSpeechDto: GenerateSpeechDto,
    @Res() res: Response,
  ) {
    try {
      this._logger.log(
        `Received request for ElevenLabs TTS: ${generateSpeechDto.text.substring(0, 50)}...`,
      );
      const audioBuffer =
        await this._aiService.generateSpeech(generateSpeechDto);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
      res.status(HttpStatus.OK).send(audioBuffer);
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof HttpException
          ? error.message
          : 'Internal server error while generating speech';

      this._logger.error(
        `Error in ElevenLabs TTS endpoint: ${message}`,
        error.stack,
      );
      // Menggunakan ResponseHelper untuk error
      return res.status(status).json(ResponseHelper.error(message, status)); // <-- Perbaikan format response error
    }
  }

  /**
   * Endpoint untuk menghasilkan ulang audio dari teks menggunakan ElevenLabs.
   * Fungsinya mirip dengan generate, namun path berbeda untuk kemungkinan tracking atau UI/UX.
   * Memerlukan autentikasi JWT.
   * @param generateSpeechDto DTO berisi teks dan konfigurasi suara opsional.
   * @param res Objek Response Express untuk mengirim audio.
   * @returns Streaming audio atau JSON response error.
   */
  @Post('text-to-speech/elevenlabs/regenerate')
  @UseGuards(JwtAuthGuard)
  async regenerateSpeechFromText(
    @Body() generateSpeechDto: GenerateSpeechDto,
    @Res() res: Response,
  ) {
    try {
      this._logger.log(
        `Received request for ElevenLabs TTS Regeneration: ${generateSpeechDto.text.substring(0, 50)}...`,
      );
      // Memanggil service method yang sama dengan generate
      const audioBuffer =
        await this._aiService.generateSpeech(generateSpeechDto);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="regenerated_speech.mp3"',
      );
      res.status(HttpStatus.OK).send(audioBuffer);
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof HttpException
          ? error.message
          : 'Internal server error while regenerating speech';

      this._logger.error(
        `Error in ElevenLabs TTS regenerate endpoint: ${message}`,
        error.stack,
      );
      return res.status(status).json(ResponseHelper.error(message, status));
    }
  }

  /**
   * Endpoint untuk mendapatkan daftar suara yang tersedia dari ElevenLabs.
   * Memerlukan autentikasi JWT.
   * @param res Objek Response Express.
   * @returns JSON response berisi daftar suara atau error.
   */
  @Get('text-to-speech/elevenlabs/voices')
  // @UseGuards(JwtAuthGuard)
  async listElevenLabsVoices(@Res() res: Response) {
    try {
      this._logger.log('Received request to list ElevenLabs voices.');
      const voices = await this._aiService.listElevenLabsVoices();
      return res
        .status(HttpStatus.OK)
        .json(
          ResponseHelper.success(
            'Successfully fetched ElevenLabs voices',
            voices,
          ),
        );
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof HttpException
          ? error.message
          : 'Internal server error while fetching voices';

      this._logger.error(
        `Error in ElevenLabs list voices endpoint: ${message}`,
        error.stack,
      );
      return res.status(status).json(ResponseHelper.error(message, status));
    }
  }
}
