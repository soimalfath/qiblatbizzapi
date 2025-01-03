import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../../entities/**/*.entity.{js,ts}'],
    synchronize: process.env.NODE_ENV !== 'production',
    autoLoadEntities: true,
    migrations: ['dist/migrations/*{.ts,.js}'],
    // migrationsRun: true,
    // npm run migration:generate src/migrations/AddPhoneAndIsActive
  }),
);
