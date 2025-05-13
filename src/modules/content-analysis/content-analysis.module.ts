import { Module, Logger } from '@nestjs/common';
import { ContentAnalysisService } from './content-analysis.service';
import { ContentAnalysisController } from './content-analysis.controller';
import { YoutubeModule } from '../youtube/youtube.module'; // Impor YoutubeModule
import { HttpModule } from '@nestjs/axios'; // Jika Anda berencana memanggil API Gemini/ElevenLabs langsung dari sini

/**
 * @module ContentAnalysisModule
 * @description Modul untuk fitur analisis konten cerdas, termasuk interaksi dengan AI.
 */
@Module({
  imports: [
    YoutubeModule, // Impor YoutubeModule untuk mengakses YoutubeService
    HttpModule.register({
      // Konfigurasi HttpService jika diperlukan untuk API AI
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [ContentAnalysisService, Logger], // Tambahkan Logger jika belum ada
  controllers: [ContentAnalysisController],
})
export class ContentAnalysisModule {}
