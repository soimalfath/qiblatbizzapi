import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../../entities/**/*.entity.{js,ts}'],
  migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
  synchronize: false,
});
