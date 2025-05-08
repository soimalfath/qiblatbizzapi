import { Injectable, Logger, Inject } from '@nestjs/common'; // Tambahkan Inject
import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config'; // Hapus jika tidak digunakan lagi
import { ConfigType } from '@nestjs/config'; // Tambahkan ConfigType
import geminiConfiguration from '../../../config/gemini.config'; // Impor konfigurasi gemini
import { map, catchError, firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import {
  IAiProvider,
  // IAiProviderResponse, // Removed if not used directly by the method signature
} from '../interfaces/ai-provider.interface';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class GeminiService implements IAiProvider {
  private readonly logger = new Logger(GeminiService.name);
  private readonly api_key: string;
  private readonly base_url: string;
  private readonly model_ai: string;

  constructor(
    private readonly http_service: HttpService,
    // private readonly config_service: ConfigService, // Hapus ini
    @Inject(geminiConfiguration.KEY)
    private readonly gem_config: ConfigType<typeof geminiConfiguration>, // Suntikkan geminiConfig
  ) {
    this.base_url = this.gem_config.base_url; // Gunakan dari gem_config
    this.api_key = this.gem_config.api_key; // Gunakan dari gem_config
    this.model_ai = this.gem_config.model_ai; // Gunakan dari gem_config
  }

  /**
   * Menghasilkan konten menggunakan API Google Gemini dan mengembalikan objek hasil parse.
   * @param prompt Teks prompt untuk AI.
   * @returns Promise yang berisi objek hasil parse dari respons AI atau melempar error.
   * @throws {HttpException} Jika terjadi error saat memanggil API, memproses respons, atau parsing JSON.
   */
  async generate_content(prompt: string): Promise<any> {
    // Naming convention: snake_case, return type Promise<any>
    const data = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        // Meminta output JSON secara eksplisit jika API mendukung
        response_mime_type: 'application/json',
      },
    };

    const headers: AxiosRequestConfig['headers'] = {
      'Content-Type': 'application/json',
    };

    const url = `${this.base_url}${this.model_ai}:generateContent?key=${this.api_key}`;

    this.logger.debug(`Mengirim request ke Gemini API: ${url}`);
    this.logger.debug(`Request body: ${JSON.stringify(data)}`);

    try {
      const result = await firstValueFrom(
        this.http_service.post<any>(url, data, { headers }).pipe(
          map((response) => {
            this.logger.debug(
              `Respons mentah dari Gemini API: ${JSON.stringify(response.data)}`,
            );

            const text_content =
              response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (typeof text_content !== 'string') {
              this.logger.error(
                'Respons dari Gemini API tidak memiliki struktur teks yang diharapkan.',
                JSON.stringify(response.data),
              );
              throw new HttpException(
                'Respons dari Gemini API tidak memiliki struktur yang diharapkan',
                HttpStatus.BAD_GATEWAY,
              );
            }

            this.logger.log('Berhasil mengekstrak konten teks dari Gemini.');

            try {
              // Hapus backticks markdown jika ada sebelum parsing
              const cleaned_text = text_content.replace(
                /^```json\s*|```$/g,
                '',
              );
              const parsed_object = JSON.parse(cleaned_text);
              this.logger.log('Berhasil mem-parsing JSON dari respons teks.');
              return parsed_object; // Kembalikan objek hasil parse
            } catch (parse_error) {
              this.logger.error(
                'Gagal mem-parsing JSON dari respons teks Gemini:',
                parse_error.message,
                `Teks asli: ${text_content}`, // Log teks asli untuk debug
              );
              throw new HttpException(
                'Gagal mem-parsing respons JSON dari AI',
                HttpStatus.INTERNAL_SERVER_ERROR, // Atau BAD_GATEWAY jika dianggap error dari AI
              );
            }
          }),
          catchError((error) => {
            this.logger.error(
              'Error saat memanggil Gemini API:',
              error.response?.data || error.message,
              error.stack,
            );
            throw new HttpException(
              error.response?.data?.error?.message ||
                'Gagal menghubungi Gemini API',
              error.response?.status || HttpStatus.BAD_GATEWAY,
            );
          }),
        ),
      );
      return result;
    } catch (error) {
      this.logger.error(
        'Error dalam generate_content setelah pemanggilan API:',
        error,
      );
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Terjadi kesalahan internal saat memproses permintaan AI',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
