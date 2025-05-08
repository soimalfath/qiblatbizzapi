import { registerAs } from '@nestjs/config';

/**
 * Konfigurasi untuk layanan Gemini AI.
 * Mengambil nilai dari environment variables.
 */
const geminiConfig = registerAs('gemini', () => ({
  api_key: process.env.GEMINI_APIKEY,
  base_url: process.env.GEMINI_BASE_URL,
  model_ai: process.env.GEMINI_MODEL_NAME,
}));

export default geminiConfig;
