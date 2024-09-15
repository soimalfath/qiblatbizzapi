import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Current working directory:', process.cwd());
  console.log('DB_HOST:', process.env.DB_HOST);
  const app = await NestFactory.create(AppModule);

  await app.listen(5000, () => {
    console.log(`⚡️crud-apps: Server is running at http://localhost:5000`);
  });
}
bootstrap();
