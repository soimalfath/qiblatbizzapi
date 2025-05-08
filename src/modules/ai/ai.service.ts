import { Injectable, Logger } from '@nestjs/common'; // Tambahkan Logger
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { map, catchError } from 'rxjs/operators';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  AiProviderFactory,
  AiProviderType,
} from './factories/ai-provider.factory'; // Impor Factory
import { CreateYoutubeContentDto } from './dto/create-youtube-content.dto'; // Impor DTO

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name); // Tambahkan logger
  private readonly geminiApiKey: string;
  private readonly geminiBaseUrl: string;
  private readonly geminiModelName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly aiProviderFactory: AiProviderFactory, // Suntikkan Factory
  ) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_APIKEY');
    this.geminiBaseUrl = this.configService.get<string>('GEMINI_BASE_URL');
    this.geminiModelName = this.configService.get<string>('GEMINI_MODEL_NAME');
  }

  /**
   * Menghasilkan copywriting berdasarkan prompt yang diberikan menggunakan Gemini.
   * @param prompt_text Teks prompt untuk AI.
   * @returns Observable yang berisi data respons dari API Gemini atau HttpException jika terjadi error.
   */
  generateCopyWriting(prompt_text: string) {
    const url = `${this.geminiBaseUrl}${this.geminiModelName}:generateContent?key=${this.geminiApiKey}`;
    const headers = { 'Content-Type': 'application/json' };
    const body = {
      contents: [
        {
          parts: [{ text: prompt_text }],
        },
      ],
    };

    return this.httpService.post(url, body, { headers }).pipe(
      map((response) => {
        // Ekstrak teks dari respons Gemini
        try {
          return response.data.candidates[0].content.parts[0].text;
        } catch (e) {
          this.logger.error(
            'Error parsing Gemini response for copywriting:',
            e,
          );
          this.logger.debug(
            'Full Gemini response:',
            JSON.stringify(response.data),
          );
          throw new HttpException(
            'Gagal memproses respons dari AI',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }),
      catchError((error) => {
        this.logger.error(
          'Error calling Gemini API for copywriting:',
          error.response?.data || error.message,
        );
        throw new HttpException(
          error.response?.data?.error?.message ||
            'Gagal menghubungi AI Service',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    );
  }

  /**
   * Menghasilkan konten YouTube lengkap (skrip, SEO, ide thumbnail) berdasarkan DTO.
   * @param dto Data Transfer Object berisi detail permintaan konten.
   * @returns Promise yang berisi data mentah dari AI provider.
   */
  async generate_youtube_content(dto: CreateYoutubeContentDto): Promise<any> {
    const provider_name: AiProviderType = 'gemini'; // <-- Provider diatur ke Gemini
    const ai_provider = this.aiProviderFactory.getProvider(provider_name);

    const master_prompt = this._build_youtube_content_prompt(dto);

    try {
      // Ambil hasil mentah dari AI provider dan return langsung
      const raw_response = await ai_provider.generate_content(master_prompt); // <-- Changed method call to snake_case
      this.logger.log(
        `Raw AI Response type for topic "${dto.topic}": ${typeof raw_response}`,
      );
      this.logger.debug(
        // <-- Log ini menunjukkan raw_response adalah {"source":{"source":{}}}
        `Raw AI Response value for topic "${dto.topic}":`,
        typeof raw_response === 'object'
          ? JSON.stringify(raw_response, null, 2)
          : raw_response,
      );
      return raw_response; // <-- Mengembalikan nilai mentah tersebut
    } catch (error) {
      this.logger.error(
        `Error during YouTube content generation for topic "${dto.topic}":`,
        error,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to generate content: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Membangun prompt master untuk generasi konten YouTube.
   * @param dto Data Transfer Object berisi detail permintaan konten.
   * @returns String prompt yang siap digunakan.
   * @private
   */
  private _build_youtube_content_prompt(dto: CreateYoutubeContentDto): string {
    // Logika pembuatan prompt yang sebelumnya ada di PromptBuilderService
    return `
Tolong buatkan konten YouTube lengkap tentang topik "[ ${dto.topic} ]" dengan detail berikut.
PENTING: Kembalikan respons HANYA sebagai objek JSON yang valid tanpa teks tambahan sebelum atau sesudahnya. Strukturnya harus seperti ini:
{
  "topic": "${dto.topic}",
  "basicInfo": {
    "purpose": "${dto.purpose}",
    "targetAudience": "${dto.targetAudience}",
    "style": "${dto.style}",
    "tone": "${dto.tone}", 
    "duration": "${dto.duration}",
    "styleReference": "${dto.styleReference}",
    "visualStyleReference": "${dto.styleReference}"
  },
  "script": {
    "hook": {
      "style": "${dto.hookStyle}", 
      "content": "String (5 detik pertama yang menarik)"
    },
    "intro": "String (perkenalan topik + preview isi video)",
    "mainPoints": [
      {
        // "title": "Judul",
        "content": "script utama"
      },
      // {
      //   "title": "Judul Poin 2",
      //   "content": "Penjelasan detail atau narasi poin 2"
      // }
      // Tambah sesuai kebutuhan
    ],
    "conclusion": "String (kesimpulan akhir + rekap)",
    "cta": {
      "inVideo": "String (ajakan interaksi di bagian akhir video)",
      "inDescription": "String (template CTA di deskripsi + link jika perlu)"
    }
  },
  "seo": {
    "titleOptions": [
      "String (Opsi judul 1, pola: [How to/List/Why] + [Keyword Utama] + [Manfaat])",
      "String (Opsi judul 2)",
      "String (Opsi judul 3)"
    ],
    "description": {
      "paragraph1": "String (Ringkasan video + keyword)",
      "paragraph2": "String (Timestamp jika relevan, jika tidak kosongkan)",
      "paragraph3": "String (CTA + link sosial media)"
    },
    "tags": ["String (keyword 1)", "String (keyword 2)", "..."]
  },
  "thumbnailIdeas": [
    {
      "ideaNumber": 1,
      "style": "String (Contoh: Minimalis/Bold/Close-up)",
      "dominantColor": "String (Contoh: Merah/Biru/Neon)",
      "textOverlay": "Teks pendek maks 5 kata font tebal",
      "imageType": "Gambar ilustrasi/foto wajah/product shot"
    },
    {
      "ideaNumber": 2,
      "style": "String",
      "dominantColor": "String",
      "textOverlay": "String",
      "imageType": "String"
    }
  ],
  "crossPlatformTips": {
    "shorts": "String (Potong bagian tertentu jadi Shorts)",
    "tiktok": "String (Reformat bagian tertentu + caption menarik)",
    "instagramReels": "String (Gunakan bagian spesifik dengan call to action visual)"
  },
  "additionalNotes": {
    "language": "${dto.language}",
    "avoidContent": ["${dto.avoidContent?.join('", "') || ''}"],
    "includeExamples": true
  }
}


Pastikan untuk mengisi semua nilai string sesuai instruksi dan topik. Gunakan contoh nyata atau analogi dalam skrip jika relevan. Hindari klise "jangan lupa like-subscribe" di awal skrip.
    `.trim();
  }
}
