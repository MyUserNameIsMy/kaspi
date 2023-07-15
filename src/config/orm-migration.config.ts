import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { SeederOptions } from 'typeorm-extension';

config();

const configService = new ConfigService();

const options: DataSourceOptions & SeederOptions = {
  migrationsTableName: 'migrations',
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  logging: true,
  synchronize: false,
  entities: [path.join(__dirname, '..', '/**/*.entity.{ts, js}')],
  migrations: [path.join(__dirname, '..', 'database/migrations/*.{ts, js}')],
  seeds: [path.join(__dirname, '..', 'database/seeds/*.{ts, js}')],
  factories: [path.join(__dirname, '..', 'database/factories/*.{ts, js}')],
  subscribers: [
    path.join(__dirname, '..', 'database/subscriber/**/*{.ts,.js}'),
  ],
};

export const dataSource = new DataSource(options);
