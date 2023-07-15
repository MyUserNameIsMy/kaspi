import { Module } from '@nestjs/common';
import { KaspiModule } from './modules/kaspi/kaspi.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getOrmAsyncConfig } from './config/orm-async.config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(getOrmAsyncConfig()),
    KaspiModule,
  ],
})
export class AppModule {}
