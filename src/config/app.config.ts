import { registerAs } from '@nestjs/config';

/**
 * Konfigurasi umum aplikasi.
 * Mengambil nilai dari environment variables.
 */
const appConfiguration = registerAs('app', () => ({
  frontEndUrl: process.env.FRONT_END_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
}));

export default appConfiguration;
