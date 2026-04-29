import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

export default new DataSource({
  ssl: process.env.STAGE === 'prod' || process.env.DB_SSL === 'true',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT ?? '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  schema: process.env.DB_SCHEMA ?? 'public',

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],

  // logging: true,
  synchronize: false,
});
