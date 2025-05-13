import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Logger, // Tambahkan Logger
} from '@nestjs/common';
import { ContentAnalysisService } from './content-analysis.service';
import {
  AnalyzeTrendingContentRequestDto,
  AnalyzeTrendingContentResponseDto,
} from './dto/analyze-trending-content.dto';
import {
  AnalyzeVideoByIdRequestDto,
  AnalyzeVideoByIdResponseDto,
} from './dto/analyze-video-by-id.dto'; // <-- Impor DTO baru
// import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'; // <-- Pastikan ini di-uncomment

/**
 * @class ContentAnalysisController
 * @description Pengontrol untuk endpoint terkait analisis konten cerdas.
 */
// @ApiTags('Content Analysis (AI)') // <-- Di-uncomment
@Controller('content-analysis')
@UseInterceptors(ClassSerializerInterceptor)
export class ContentAnalysisController {
  private readonly _logger = new Logger(ContentAnalysisController.name);

  constructor(
    private readonly _contentAnalysisService: ContentAnalysisService,
  ) {}

  /**
   * @method analyzeTrendingContent
   * @description Menganalisis video trending untuk memberikan wawasan konten kepada YouTuber pemula.
   * Endpoint ini mengambil video trending berdasarkan parameter yang diberikan,
   * kemudian (secara simulasi) menggunakan AI untuk menganalisisnya dan memberikan saran.
   * @param {AnalyzeTrendingContentRequestDto} analyzeTrendingContentDto Parameter untuk analisis.
   * @returns {Promise<AnalyzeTrendingContentResponseDto>} Hasil analisis tren.
   */
  @Post('analyze-trending')
  // @ApiOperation({
  //   // <-- Di-uncomment
  //   summary: 'Analisis Tren Konten Cerdas (Simulasi AI)',
  //   description:
  //     'Menganalisis video trending dan memberikan wawasan konten menggunakan (simulasi) AI. ' +
  //     'Fitur ini bertujuan membantu YouTuber pemula menemukan ide konten yang relevan dan berpotensi populer.',
  // })
  // @ApiBody({
  //   // <-- Di-uncomment
  //   type: AnalyzeTrendingContentRequestDto,
  //   description: 'Parameter untuk analisis tren konten.',
  // })
  // @ApiResponse({
  //   // <-- Di-uncomment
  //   status: 200,
  //   description: 'Analisis tren konten berhasil dikembalikan.',
  //   type: AnalyzeTrendingContentResponseDto,
  // })
  // @ApiResponse({ status: 400, description: 'Input tidak valid.' }) // Di-uncomment
  // @ApiResponse({
  //   // Di-uncomment
  //   status: 404,
  //   description:
  //     'Tidak ada video trending yang ditemukan untuk parameter yang diberikan.',
  // })
  // @ApiResponse({ status: 500, description: 'Kesalahan server internal.' }) // Di-uncomment
  async analyzeTrendingContent(
    @Body() analyzeTrendingContentDto: AnalyzeTrendingContentRequestDto,
  ): Promise<AnalyzeTrendingContentResponseDto> {
    this._logger.log(
      `Menerima permintaan untuk analyze-trending dengan DTO: ${JSON.stringify(analyzeTrendingContentDto)}`,
    );
    return this._contentAnalysisService.analyzeTrendingContent(
      analyzeTrendingContentDto,
    );
  }

  /**
   * @method analyzeVideoById
   * @description Menganalisis video tunggal berdasarkan ID untuk memberikan wawasan konten.
   * @param {AnalyzeVideoByIdRequestDto} analyzeVideoByIdDto Parameter permintaan berisi ID video.
   * @returns {Promise<AnalyzeVideoByIdResponseDto>} Hasil analisis video.
   */
  // @Post('analyze-by-id')
  // @ApiOperation({
  //   summary: 'Analisis Video Berdasarkan ID (Simulasi AI)',
  //   description:
  //     'Menganalisis video YouTube tunggal berdasarkan ID-nya dan memberikan saran konten, SEO, thumbnail, CTA, dan engagement (simulasi AI).',
  // })
  // @ApiBody({
  //   type: AnalyzeVideoByIdRequestDto,
  //   description: 'Parameter untuk analisis video berdasarkan ID.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Analisis video berhasil dikembalikan.',
  //   type: AnalyzeVideoByIdResponseDto,
  // })
  // @ApiResponse({ status: 400, description: 'Input tidak valid.' })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Video dengan ID yang diberikan tidak ditemukan.',
  // })
  // @ApiResponse({ status: 500, description: 'Kesalahan server internal.' })
  async analyzeVideoById(
    @Body() analyzeVideoByIdDto: AnalyzeVideoByIdRequestDto,
  ): Promise<AnalyzeVideoByIdResponseDto> {
    this._logger.log(
      `Menerima permintaan untuk analyze-by-id dengan DTO: ${JSON.stringify(analyzeVideoByIdDto)}`,
    );
    return this._contentAnalysisService.analyzeVideoById(analyzeVideoByIdDto);
  }
}
