import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: process.env.FRONT_END_URL, // Mengizinkan asal ini
    credentials: true, // Jika menggunakan cookies atau header otentikasi
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'User-Agent',
    ],
  };
  app.enableCors(corsOptions);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());

  await app.listen(5000, () => {
    console.log(`⚡️crud-apps: Server is running at http://localhost:5000`);
  });
}
bootstrap();
