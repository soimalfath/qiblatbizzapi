import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject, // <-- Tambahkan Inject
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config'; // Hapus ConfigService jika tidak digunakan lagi untuk ElevenLabs
import { ConfigType } from '@nestjs/config'; // <-- Tambahkan ConfigType
import elevenLabsConfiguration from '../../../config/elevenlabs.config'; // <-- Impor konfigurasi ElevenLabs
import { IAiProvider } from '../interfaces/ai-provider.interface';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosError } from 'axios';
import {
  IElevenLabsVoice,
  IElevenLabsVoicesResponse,
} from '../interfaces/elevenlabs.interface';

interface IElevenLabsPromptPayload {
  text: string;
  voiceId?: string;
  modelId?: string;
}

/**
 * Service untuk berinteraksi dengan API Text-to-Speech ElevenLabs.
 */
@Injectable()
export class ElevenLabsService implements IAiProvider {
  private readonly _logger = new Logger(ElevenLabsService.name);
  private readonly _apiKey: string;
  private readonly _baseUrl: string;
  private readonly _defaultVoiceId: string;
  private readonly _defaultModelId: string;

  constructor(
    private readonly _httpService: HttpService,
    // private readonly _configService: ConfigService, // Hapus jika diganti
    @Inject(elevenLabsConfiguration.KEY) // <-- Suntikkan konfigurasi ElevenLabs
    private readonly _elevenLabsConfig: ConfigType<
      typeof elevenLabsConfiguration
    >,
  ) {
    this._apiKey = this._elevenLabsConfig.apiKey;
    this._baseUrl = this._elevenLabsConfig.baseUrl;
    this._defaultVoiceId = this._elevenLabsConfig.defaultVoiceId;
    this._defaultModelId = this._elevenLabsConfig.defaultModelId;

    // Validasi API Key sudah dilakukan di file konfigurasi,
    // namun bisa ditambahkan pengecekan di sini jika diperlukan untuk logika service.
    if (!this._apiKey) {
      this._logger.error(
        'ElevenLabs API Key is not configured. Service might not work.',
      );
      // Pertimbangkan untuk melempar error di sini jika service tidak bisa berfungsi tanpa API Key
      // throw new Error('ElevenLabs API Key is missing in configuration.');
    }
  }

  /**
   * Menghasilkan audio dari teks menggunakan API ElevenLabs.
   * @param promptJsonString String JSON yang berisi 'text' dan opsional 'voiceId', 'modelId'.
   * @returns Promise yang berisi Buffer audio.
   * @throws {HttpException} Jika panggilan API gagal atau prompt tidak valid.
   */
  async generateContent(promptJsonString: string): Promise<Buffer> {
    let payload: IElevenLabsPromptPayload;
    try {
      payload = JSON.parse(promptJsonString);
    } catch (error) {
      this._logger.error(
        'Gagal mem-parsing JSON prompt untuk ElevenLabs:',
        error.message,
      );
      throw new HttpException(
        'Format prompt tidak valid untuk ElevenLabs TTS.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { text, voiceId: customVoiceId, modelId: customModelId } = payload;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      this._logger.error('Teks untuk sintesis suara kosong atau tidak valid.');
      throw new HttpException(
        'Teks untuk sintesis suara tidak boleh kosong.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const voiceIdToUse = customVoiceId || this._defaultVoiceId;
    const modelIdToUse = customModelId || this._defaultModelId;

    const url = `${this._baseUrl}/text-to-speech/${voiceIdToUse}`;
    const headers: AxiosRequestConfig['headers'] = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'xi-api-key': this._apiKey,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'audio/mpeg',
    };

    const body = {
      text,
      model_id: modelIdToUse, // API ElevenLabs menggunakan snake_case untuk model_id di body
    };

    this._logger.log(
      `Mengirim permintaan ke ElevenLabs: URL=${url}, Model=${modelIdToUse}, VoiceID=${voiceIdToUse}`,
    );

    try {
      const response = await firstValueFrom(
        this._httpService.post(url, body, {
          headers,
          responseType: 'arraybuffer',
        }),
      );
      this._logger.log(
        `Berhasil menerima audio dari ElevenLabs. Ukuran data: ${response.data.byteLength} bytes.`,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as any;
        const errorMessage =
          errorData?.detail?.message ||
          errorData?.message ||
          'Gagal menghasilkan audio dari ElevenLabs.';
        const errorStatus =
          axiosError.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
        this._logger.error(
          `Error dari API ElevenLabs (Status: ${errorStatus}): ${errorMessage}`,
          JSON.stringify(errorData),
        );
        throw new HttpException(errorMessage, errorStatus);
      } else if (axiosError.request) {
        this._logger.error(
          'Tidak ada respons dari API ElevenLabs:',
          axiosError.message,
        );
        throw new HttpException(
          'Tidak ada respons dari layanan Text-to-Speech.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        this._logger.error(
          'Error saat menyiapkan permintaan ke ElevenLabs:',
          axiosError.message,
        );
        throw new HttpException(
          'Gagal menghubungi layanan Text-to-Speech.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Mengambil daftar suara yang tersedia dari API ElevenLabs.
   * @returns Promise yang berisi array objek suara.
   * @throws {HttpException} Jika terjadi error saat memanggil API.
   */
  async listVoices(): Promise<IElevenLabsVoice[]> {
    const url = `${this._baseUrl}/voices`; // Menggunakan baseUrl dari config
    const headers: AxiosRequestConfig['headers'] = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'xi-api-key': this._apiKey, // Menggunakan apiKey dari config
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'application/json',
    };

    this._logger.log(
      `Mengambil suara yang tersedia dari ElevenLabs: URL=${url}`,
    );

    try {
      const response = await firstValueFrom(
        this._httpService.get<IElevenLabsVoicesResponse>(url, { headers }),
      );
      this._logger.log(
        `Berhasil mengambil ${response.data.voices.length} suara dari ElevenLabs.`,
      );
      return response.data.voices.map((voice: any) => ({
        voiceId: voice.voice_id,
        name: voice.name,
        samples:
          voice.samples?.map((sample: any) => ({
            sampleId: sample.sample_id,
            fileName: sample.file_name,
            mimeType: sample.mime_type,
            sizeBytes: sample.size_bytes,
            hash: sample.hash,
          })) || null,
        category: voice.category,
        fineTuning: {
          modelId: voice.fine_tuning?.model_id,
          language: voice.fine_tuning?.language,
          isAllowedToFineTune: voice.fine_tuning?.is_allowed_to_fine_tune,
          fineTuningRequested: voice.fine_tuning?.fine_tuning_requested,
          finetuningState: voice.fine_tuning?.finetuning_state,
          verificationAttempts: voice.fine_tuning?.verification_attempts,
          verificationFailures: voice.fine_tuning?.verification_failures || [],
          verificationAttemptsCount:
            voice.fine_tuning?.verification_attempts_count || 0,
          sliceIds: voice.fine_tuning?.slice_ids,
          manualVerification: voice.fine_tuning?.manual_verification,
          manualVerificationRequested:
            voice.fine_tuning?.manual_verification_requested,
        },
        labels: voice.labels || {},
        description: voice.description,
        previewUrl: voice.preview_url,
        availableForTiers: voice.available_for_tiers || [],
        settings: voice.settings
          ? {
              stability: voice.settings.stability,
              similarityBoost: voice.settings.similarity_boost,
              style: voice.settings.style,
              useSpeakerBoost: voice.settings.use_speaker_boost,
            }
          : null,
        sharing: voice.sharing,
        highQualityBaseModelIds: voice.high_quality_base_model_ids || [],
      }));
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as any;
        const errorMessage =
          errorData?.detail?.message ||
          errorData?.message ||
          'Gagal mengambil daftar suara dari ElevenLabs.';
        const errorStatus =
          axiosError.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
        this._logger.error(
          `Error dari API ElevenLabs (Status: ${errorStatus}) saat mengambil daftar suara: ${errorMessage}`,
          JSON.stringify(errorData),
        );
        throw new HttpException(errorMessage, errorStatus);
      } else if (axiosError.request) {
        this._logger.error(
          'Tidak ada respons dari API ElevenLabs saat mengambil daftar suara:',
          axiosError.message,
        );
        throw new HttpException(
          'Tidak ada respons dari layanan daftar suara Text-to-Speech.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        this._logger.error(
          'Error saat menyiapkan permintaan ke ElevenLabs untuk daftar suara:',
          axiosError.message,
        );
        throw new HttpException(
          'Gagal menghubungi layanan daftar suara Text-to-Speech.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
