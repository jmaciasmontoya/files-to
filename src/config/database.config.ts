import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { File } from '../modules/files/entities/file.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'filemanager',
  entities: [File],
  synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
};
