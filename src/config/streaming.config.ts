import { registerAs } from '@nestjs/config';

/**
 * @interface IStreamingConfig
 * @description Mendefinisikan struktur untuk konfigurasi streaming.
 */
export interface IStreamingConfig {
  rtmpPort: number;
  httpPort: number;
  mediaRoot: string;
  allowOrigin: string;
  ffmpegPath: string;
}

/**
 * @function streamingConfiguration
 * @description Mendaftarkan konfigurasi untuk modul Streaming.
 * Mengambil nilai dari variabel lingkungan dan melakukan validasi dasar.
 * @returns {IStreamingConfig} Objek konfigurasi Streaming.
 * @throws {Error} Jika variabel lingkungan yang wajib tidak disetel.
 */
export default registerAs('streaming', (): IStreamingConfig => {
  const rtmpPort = parseInt(process.env.NMS_RTMP_PORT, 10) || 1935;
  const httpPort = parseInt(process.env.NMS_HTTP_PORT, 10) || 8000;
  const mediaRoot = process.env.NMS_MEDIA_ROOT || './media';
  const allowOrigin = process.env.NMS_ALLOW_ORIGIN || '*';
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg'; // Default ke 'ffmpeg' jika ada di PATH

  // Anda bisa menambahkan validasi yang lebih ketat di sini jika diperlukan
  // Misalnya, memastikan port adalah angka yang valid, dll.

  return {
    rtmpPort,
    httpPort,
    mediaRoot,
    allowOrigin,
    ffmpegPath,
  };
});
