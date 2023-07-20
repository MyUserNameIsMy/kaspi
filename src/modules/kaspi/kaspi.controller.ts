import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { KaspiService } from './kaspi.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { ProductUpdateRequestDto } from './dto/product.request.dto';

@ApiTags('kaspi')
@Controller('kaspi')
export class KaspiController {
  constructor(private readonly kaspiService: KaspiService) {}

  @Get()
  async findAllFiles() {
    return this.kaspiService.findAllFiles();
  }

  @Get('file/:id')
  async findOneById(
    @Param('id') file_id: number,
    @Query('product_id') product_id?: number,
  ) {
    return this.kaspiService.findOneById(file_id, product_id);
  }

  @Post('parse-excel-and-save')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async parseExcelAndSave(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return await this.kaspiService.parseAndSave(file);
  }

  @Patch('select-product/:id')
  async updateProduct(
    @Param('id') product_id: number,
    @Body() dto: ProductUpdateRequestDto,
  ) {
    return this.kaspiService.updateProduct(product_id, dto);
  }
}
