import { Injectable, Logger } from '@nestjs/common'; // Tambahkan _Logger
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { map, catchError } from 'rxjs/operators';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IElevenLabsConfig } from 'src/config/elevenlabs.config';
import {
  AiProviderFactory,
  AiProviderType,
} from './factories/ai-provider.factory'; // Impor Factory
import { CreateYoutubeContentDto } from './dto/create-youtube-content.dto'; // Impor DTO
import { GenerateSpeechDto } from './dto/generate-speech.dto';
import { ElevenLabsService } from './services/elevenlabs.service'; // Pastikan ini diimpor jika akan di-cast
import { IElevenLabsVoice } from './interfaces/elevenlabs.interface'; // <-- Impor interface

@Injectable()
export class AiService {
  private readonly _logger = new Logger(AiService.name); // Tambahkan _logger
  private readonly _geminiApiKey: string;
  private readonly _geminiBaseUrl: string;
  private readonly _geminiModelName: string;
  private readonly _elevenLabsApiKey: string;
  private readonly _elevenLabsBaseUrl: string;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _httpService: HttpService,
    private readonly _aiProviderFactory: AiProviderFactory, // Suntikkan Factory
  ) {
    const elevanLabsConfig =
      this._configService.get<IElevenLabsConfig>('elevenlabs');
    this._geminiApiKey = this._configService.get<string>('GEMINI_APIKEY');
    this._geminiBaseUrl = this._configService.get<string>('GEMINI_BASE_URL');
    this._geminiModelName =
      this._configService.get<string>('GEMINI_MODEL_NAME');
    this._elevenLabsApiKey = elevanLabsConfig.apiKey;
    this._elevenLabsBaseUrl = elevanLabsConfig.baseUrl;
  }

  /**
   * Menghasilkan copywriting berdasarkan prompt yang diberikan menggunakan Gemini.
   * @param prompt_text Teks prompt untuk AI.
   * @returns Observable yang berisi data respons dari API Gemini atau HttpException jika terjadi error.
   */
  generateCopyWriting(promptText: string) {
    const url = `${this._geminiBaseUrl}${this._geminiModelName}:generateContent?key=${this._geminiApiKey}`;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const headers = { 'Content-Type': 'application/json' };
    const body = {
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
    };

    return this._httpService.post(url, body, { headers }).pipe(
      map((response) => {
        // Ekstrak teks dari respons Gemini
        try {
          return response.data.candidates[0].content.parts[0].text;
        } catch (e) {
          this._logger.error(
            'Error parsing Gemini response for copywriting:',
            e,
          );
          this._logger.debug(
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
        this._logger.error(
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
  async generateYoutubeContent(dto: CreateYoutubeContentDto): Promise<any> {
    const providerName: AiProviderType = 'gemini'; // <-- Provider diatur ke Gemini
    const aiProvider = this._aiProviderFactory.getProvider(providerName);

    const masterPrompt = this._buildYoutubeContentPrompt(dto);

    try {
      // Ambil hasil mentah dari AI provider dan return langsung
      const rawResponse = await aiProvider.generateContent(masterPrompt); // <-- Changed method call to snake_case
      this._logger.log(
        `Raw AI Response type for topic "${dto.topic}": ${typeof rawResponse}`,
      );
      this._logger.debug(
        // <-- Log ini menunjukkan rawResponse adalah {"source":{"source":{}}}
        `Raw AI Response value for topic "${dto.topic}":`,
        typeof rawResponse === 'object'
          ? JSON.stringify(rawResponse, null, 2)
          : rawResponse,
      );
      return rawResponse; // <-- Mengembalikan nilai mentah tersebut
    } catch (error) {
      this._logger.error(
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
   * Menghasilkan audio dari teks menggunakan ElevenLabs.
   * @param generateSpeechDto DTO yang berisi teks dan konfigurasi suara opsional.
   * @returns Promise yang berisi Buffer audio.
   * @throws {HttpException} Jika terjadi error saat memanggil API atau memproses.
   */
  async generateSpeech(generateSpeechDto: GenerateSpeechDto): Promise<Buffer> {
    const providerName: AiProviderType = 'elevenlabs'; // Tentukan provider ElevenLabs
    const aiProvider = this._aiProviderFactory.getProvider(providerName);

    // ElevenLabsService.generateContent mengharapkan string JSON sebagai prompt
    // yang berisi text, voiceId (opsional), dan modelId (opsional).
    const promptPayload = {
      text: generateSpeechDto.text,
      voiceId: generateSpeechDto.voiceId,
      modelId: generateSpeechDto.modelId,
    };

    try {
      this._logger.log(
        `Generating speech with ElevenLabs for text: "${generateSpeechDto.text.substring(0, 50)}..."`,
      );
      const audioBuffer = await aiProvider.generateContent(
        JSON.stringify(promptPayload),
      );
      if (!(audioBuffer instanceof Buffer)) {
        this._logger.error(
          'ElevenLabs service did not return a Buffer.',
          typeof audioBuffer,
        );
        throw new HttpException(
          'Failed to generate audio: Invalid response format from provider.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this._logger.log('Successfully generated speech audio buffer.');
      return audioBuffer;
    } catch (error) {
      this._logger.error(
        'Error during ElevenLabs speech generation:',
        error.message,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to generate speech: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Mendapatkan daftar suara yang tersedia dari ElevenLabs.
   * @returns Promise yang berisi array objek suara.
   * @throws {HttpException} Jika terjadi error.
   */
  async listElevenLabsVoices(): Promise<IElevenLabsVoice[]> {
    const providerName: AiProviderType = 'elevenlabs';
    const aiProvider = this._aiProviderFactory.getProvider(providerName);

    // Pastikan provider adalah instance dari ElevenLabsService untuk memanggil listVoices
    // Ini adalah cara aman untuk memastikan metode tersebut ada.
    if (!(aiProvider instanceof ElevenLabsService)) {
      this._logger.error(
        'Provider is not an instance of ElevenLabsService. Cannot list voices.',
      );
      throw new HttpException(
        'Voice listing is not supported by the configured AI provider.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      this._logger.log('Fetching list of voices from ElevenLabs provider.');
      const voices = await aiProvider.listVoices();
      this._logger.log(`Successfully fetched ${voices.length} voices.`);
      return voices;
    } catch (error) {
      this._logger.error(
        'Error during ElevenLabs voice listing:',
        error.message,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to list voices: ${error.message}`,
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
  private _buildYoutubeContentPrompt(dto: CreateYoutubeContentDto): string {
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
