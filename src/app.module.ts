import { Module } from '@nestjs/common';
import { KaspiModule } from './modules/kaspi/kaspi.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getOrmAsyncConfig } from './config/orm-async.config';
import { MulterModule } from '@nestjs/platform-express';
import { UserModule } from './modules/user/user.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from './config/jwt.config';

@Module({
  imports: [
    MulterModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(getOrmAsyncConfig()),
    JwtModule.registerAsync(getJWTConfig()),
    KaspiModule,
    UserModule,
    AuthenticationModule,
  ],
})
export class AppModule {}
