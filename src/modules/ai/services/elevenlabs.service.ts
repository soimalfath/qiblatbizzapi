import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IAiProvider } from '../interfaces/ai-provider.interface';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosError } from 'axios';

interface IElevenLabsPromptPayload {
  text: string;
  voice_id?: string;
  model_id?: string;
}

/**
 * Layanan untuk berinteraksi dengan API ElevenLabs untuk Text-to-Speech.
 */
@Injectable()
export class ElevenLabsService implements IAiProvider {
  private readonly logger = new Logger(ElevenLabsService.name);
  private readonly api_key: string;
  private readonly base_url: string;
  private readonly default_voice_id: string;
  private readonly default_model_id: string;

  constructor(
    private readonly http_service: HttpService,
    private readonly config_service: ConfigService,
  ) {
    this.api_key = this.config_service.get<string>('ELEVENLABS_API_KEY');
    this.base_url = this.config_service.get<string>(
      'ELEVENLABS_BASE_URL',
      'https://api.elevenlabs.io/v1',
    );
    this.default_voice_id = this.config_service.get<string>(
      'ELEVENLABS_DEFAULT_VOICE_ID',
      '21m00Tcm4TlvDq8ikWAM',
    ); // Contoh ID suara default (Rachel)
    this.default_model_id = this.config_service.get<string>(
      'ELEVENLABS_DEFAULT_MODEL_ID',
      'eleven_multilingual_v2',
    );

    if (!this.api_key) {
      this.logger.error('ELEVENLABS_API_KEY tidak dikonfigurasi.');
      throw new Error('ELEVENLABS_API_KEY tidak dikonfigurasi.');
    }
  }

  /**
   * Menghasilkan audio ucapan dari teks menggunakan API ElevenLabs.
   * @param prompt_json_string String JSON yang berisi 'text', dan secara opsional 'voice_id', 'model_id'.
   * @returns Promise yang menghasilkan Buffer berisi data audio.
   * @throws {HttpException} Jika panggilan API gagal atau prompt tidak valid.
   */
  async generate_content(prompt_json_string: string): Promise<Buffer> {
    let payload: IElevenLabsPromptPayload;
    try {
      payload = JSON.parse(prompt_json_string);
    } catch (error) {
      this.logger.error(
        'Gagal mem-parse string JSON prompt untuk ElevenLabs:',
        error.message,
      );
      throw new HttpException(
        'Format prompt tidak valid untuk ElevenLabs TTS.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const {
      text,
      voice_id: custom_voice_id,
      model_id: custom_model_id,
    } = payload;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      this.logger.error('Teks untuk sintesis ucapan kosong atau tidak valid.');
      throw new HttpException(
        'Teks untuk sintesis ucapan tidak boleh kosong.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const voice_id_to_use = custom_voice_id || this.default_voice_id;
    const model_id_to_use = custom_model_id || this.default_model_id;

    const url = `${this.base_url}/text-to-speech/${voice_id_to_use}`;
    const headers: AxiosRequestConfig['headers'] = {
      'Content-Type': 'application/json',
      'xi-api-key': this.api_key,
      Accept: 'audio/mpeg', // Meminta format audio MPEG
    };

    const body = {
      text: text,
      model_id: model_id_to_use,
      // voice_settings opsional, bisa ditambahkan jika perlu
      // voice_settings: {
      //   stability: 0.5,
      //   similarity_boost: 0.75
      // }
    };

    this.logger.log(
      `Mengirim permintaan ke ElevenLabs: URL=${url}, Model=${model_id_to_use}, VoiceID=${voice_id_to_use}`,
    );

    try {
      const response = await firstValueFrom(
        this.http_service.post(url, body, {
          headers,
          responseType: 'arraybuffer', // Penting untuk mendapatkan audio sebagai Buffer
        }),
      );
      this.logger.log(
        `Berhasil menerima audio dari ElevenLabs. Ukuran data: ${response.data.byteLength} bytes.`,
      );
      return response.data;
    } catch (error) {
      const axios_error = error as AxiosError;
      if (axios_error.response) {
        // Error dari API ElevenLabs
        const error_data = axios_error.response.data as any;
        const error_message =
          error_data?.detail?.message ||
          error_data?.message ||
          'Gagal menghasilkan audio dari ElevenLabs.';
        const error_status =
          axios_error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
        this.logger.error(
          `Error dari API ElevenLabs (Status: ${error_status}): ${error_message}`,
          JSON.stringify(error_data),
        );
        throw new HttpException(error_message, error_status);
      } else if (axios_error.request) {
        // Permintaan dibuat tapi tidak ada respons
        this.logger.error(
          'Tidak ada respons dari ElevenLabs API:',
          axios_error.message,
        );
        throw new HttpException(
          'Tidak ada respons dari layanan Text-to-Speech.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Error lain saat menyiapkan permintaan
        this.logger.error(
          'Error saat menyiapkan permintaan ke ElevenLabs:',
          axios_error.message,
        );
        throw new HttpException(
          'Gagal menghubungi layanan Text-to-Speech.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Metode ini tidak relevan untuk ElevenLabs TTS karena inputnya adalah teks, bukan prompt kompleks.
   * Namun, untuk memenuhi kontrak IAiProvider, kita implementasikan sebagai no-op atau throw error.
   * @param _dto Data Transfer Object (tidak digunakan).
   * @returns String kosong atau throw error.
   * @private
   * @deprecated Tidak digunakan untuk ElevenLabsService.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _build_master_prompt(_dto: any): string {
    this.logger.warn(
      '_build_master_prompt dipanggil pada ElevenLabsService, yang seharusnya tidak terjadi.',
    );
    // Sebaiknya throw error jika ini tidak seharusnya dipanggil
    // throw new Error("Metode _build_master_prompt tidak diimplementasikan untuk ElevenLabsService.");
    return ''; // Atau kembalikan string kosong jika kontrak mengharuskan
  }
}
