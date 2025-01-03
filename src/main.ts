import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
// import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: process.env.FRONT_END_URL || 'https://localhost:3000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.enableCors(corsOptions);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  // app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(5000, () => {
    console.log(`⚡️crud-apps: Server is running at http://localhost:5000`);
  });
}
bootstrap();
