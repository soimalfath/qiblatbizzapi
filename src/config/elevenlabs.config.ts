import { registerAs } from '@nestjs/config';

/**
 * Namespace untuk konfigurasi ElevenLabs.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ELEVENLABS_CONFIG_NAMESPACE = 'elevenlabs';

export interface IElevenLabsConfig {
  apiKey: string;
  baseUrl: string;
  defaultVoiceId: string;
  defaultModelId: string;
}
/**
 * Fungsi untuk memuat dan memvalidasi konfigurasi ElevenLabs dari environment variables.
 * Menyediakan nilai default untuk beberapa variabel.
 */
export default registerAs(
  ELEVENLABS_CONFIG_NAMESPACE,
  (): IElevenLabsConfig => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      // Melempar error jika API Key tidak ada, karena ini krusial.
      // Logger tidak bisa digunakan di sini karena ini adalah file konfigurasi murni.
      // NestJS akan menangani error ini saat startup jika validasi gagal.
      throw new Error(
        'ELEVENLABS_API_KEY is not defined in environment variables.',
      );
    }

    return {
      apiKey: apiKey,
      baseUrl:
        process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1',
      defaultVoiceId:
        process.env.ELEVENLABS_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Contoh default voice ID
      defaultModelId:
        process.env.ELEVENLABS_DEFAULT_MODEL_ID || 'eleven_multilingual_v2', // Contoh default model ID
    };
  },
);
