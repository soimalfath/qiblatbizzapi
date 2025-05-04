import {
  Controller,
  Post,
  Res,
  Body,
  HttpException,
  HttpStatus, // Import HttpStatus
  Req,
  UseGuards, // Pindahkan UseGuards ke sini
  Logger, // <-- Impor Logger
} from '@nestjs/common';
import { AiService } from './ai.service';
import { Response, Request } from 'express';
import { ResponseHelper } from '../../utils/response.helper';
import { lastValueFrom } from 'rxjs';
// import { UseGuards } from '@nestjs/common'; // Hapus dari sini jika sudah di atas
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from '../products/products.service';
import { GenerateCopywriting } from './dto/create-ai.dto';
import { prompt } from '../../helper/prompt';
import { UserEntity } from '../users/entities/user.entity';
import { CreateYoutubeContentDto } from './dto/create-youtube-content.dto'; // Impor DTO YouTube
// import { RolesGuard } from '../auth/guards/roles.guard'; // Impor RolesGuard jika diperlukan
// import { Role } from '../auth/enum/role.enum';
// import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name); // <-- Inisialisasi Logger

  constructor(
    private readonly aiService: AiService,
    private readonly productService: ProductsService, // Tetap inject jika masih dipakai di method lain
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
      const product_id = generateCopywriting.productId; // Gunakan snake_case jika diinginkan, tapi DTO pakai camelCase
      const user_id = user.id;
      const type = generateCopywriting.type;
      const product = await this.productService.findOne(+product_id, user_id);
      const prompting = prompt(
        type,
        product.description,
        product.name,
        product.categories,
      );
      const data = await lastValueFrom(
        this.aiService.generateCopyWriting(prompting),
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
  async generate_youtube_content(
    @Body() createYoutubeContentDto: CreateYoutubeContentDto,
    @Res() res: Response,
    // @Req() req: Request, // req bisa digunakan jika perlu info user
  ) {
    try {
      // const user = req.user as UserEntity; // Uncomment jika perlu info user
      const generated_content = await this.aiService.generate_youtube_content(
        createYoutubeContentDto,
      );

      // <-- Tambahkan log di sini untuk memeriksa isi generated_content
      this.logger.debug(
        `Konten yang dihasilkan sebelum dikirim ke ResponseHelper: ${JSON.stringify(generated_content, null, 2)}`,
      );

      // Menggunakan ResponseHelper untuk sukses
      return res.status(HttpStatus.OK).json(
        ResponseHelper.success(
          'Success generate YouTube content',
          generated_content, // Pastikan ini adalah objek yang diharapkan
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
      this.logger.error(
        `Error di generate_youtube_content: ${message}`,
        error.stack,
      );

      // Kirim respons error menggunakan ResponseHelper
      return res.status(status).json(ResponseHelper.error(message, status));
    }
  }
}
