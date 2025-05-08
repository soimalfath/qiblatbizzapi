import { registerAs } from '@nestjs/config';

/**
 * @interface YoutubeConfig
 * @description Mendefinisikan struktur untuk konfigurasi YouTube.
 */
export interface IYoutubeConfig {
  api_key: string;
  base_url: string;
}

/**
 * @function youtubeConfiguration
 * @description Mendaftarkan konfigurasi untuk modul YouTube.
 * Mengambil nilai dari variabel lingkungan dan melakukan validasi dasar.
 * @returns {YoutubeConfig} Objek konfigurasi YouTube.
 * @throws {Error} Jika variabel lingkungan YOUTUBE_API_KEY atau YOUTUBE_API_BASE_URL tidak disetel.
 */
export default registerAs('youtube', (): IYoutubeConfig => {
  const api_key = process.env.YOUTUBE_API_KEY;
  const base_url = process.env.YOUTUBE_API_BASE_URL;

  if (!api_key) {
    throw new Error('Variabel lingkungan YOUTUBE_API_KEY tidak disetel.');
  }
  if (!base_url) {
    throw new Error('Variabel lingkungan YOUTUBE_API_BASE_URL tidak disetel.');
  }

  return {
    api_key,
    base_url,
  };
});
