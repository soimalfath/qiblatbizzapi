import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// import * as session from 'express-session';
// import * as passport from 'passport';

async function bootstrap() {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  const app = await NestFactory.create(AppModule);
  // Set up session middleware
  // app.use(
  //   session({
  //     secret: 'your-secret-key', // Replace with your own secret key
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: { secure: false }, // Set `secure: true` in production with HTTPS
  //   }),
  // );

  // // Initialize Passport and session management
  // app.use(passport.initialize());
  // app.use(passport.session());
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  await app.listen(5000, () => {
    console.log(`⚡️crud-apps: Server is running at http://localhost:5000`);
  });
}
bootstrap();
