import { Module } from '@nestjs/common';
import { KaspiService } from './kaspi.service';
import { KaspiController } from './kaspi.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { ProductEntity } from './entities/product.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([FileEntity, ProductEntity])],
  controllers: [KaspiController],
  providers: [KaspiService],
})
export class KaspiModule {}
