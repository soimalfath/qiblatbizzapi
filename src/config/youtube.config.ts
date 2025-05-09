import { registerAs } from '@nestjs/config';

/**
 * @interface YoutubeConfig
 * @description Mendefinisikan struktur untuk konfigurasi YouTube.
 */
export interface IYoutubeConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * @function youtubeConfiguration
 * @description Mendaftarkan konfigurasi untuk modul YouTube.
 * Mengambil nilai dari variabel lingkungan dan melakukan validasi dasar.
 * @returns {YoutubeConfig} Objek konfigurasi YouTube.
 * @throws {Error} Jika variabel lingkungan YOUTUBE_API_KEY atau YOUTUBE_API_BASE_URL tidak disetel.
 */
export default registerAs('youtube', (): IYoutubeConfig => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const baseUrl = process.env.YOUTUBE_API_BASE_URL;

  if (!apiKey) {
    throw new Error('Variabel lingkungan YOUTUBE_API_KEY tidak disetel.');
  }
  if (!baseUrl) {
    throw new Error('Variabel lingkungan YOUTUBE_API_BASE_URL tidak disetel.');
  }

  return {
    apiKey,
    baseUrl,
  };
});
