import { registerAs } from '@nestjs/config';

/**
 * Konfigurasi untuk layanan Gemini AI.
 * Mengambil nilai dari environment variables.
 */
const geminiConfig = registerAs('gemini', () => ({
  apiKey: process.env.GEMINI_APIKEY,
  baseUrl: process.env.GEMINI_BASE_URL,
  modelAi: process.env.GEMINI_MODEL_NAME,
}));

export default geminiConfig;
