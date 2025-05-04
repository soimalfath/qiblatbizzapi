import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
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
  private readonly api_key: string; // Naming convention: snake_case
  private readonly base_url: string; // Naming convention: snake_case
  private readonly model_ai: string; // Naming convention: snake_case

  constructor(
    private readonly http_service: HttpService, // Naming convention: snake_case
    private readonly config_service: ConfigService, // Naming convention: snake_case
  ) {
    this.base_url = this.config_service.get('GEMINI_BASE_URL');
    this.api_key = this.config_service.get('GEMINI_APIKEY');
    this.model_ai = this.config_service.get('GEMINI_MODEL_NAME');
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
