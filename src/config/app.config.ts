import { registerAs } from '@nestjs/config';

/**
 * Konfigurasi umum aplikasi.
 * Mengambil nilai dari environment variables.
 */
const appConfiguration = registerAs('app', () => ({
  front_end_url: process.env.FRONT_END_URL,
  node_env: process.env.NODE_ENV || 'development',
}));

export default appConfiguration;
