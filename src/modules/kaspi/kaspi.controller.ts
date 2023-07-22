import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
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
import { Response } from 'express';

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

  @Delete('file/:id')
  async deleteFile(@Param('id') file_id: number) {
    return await this.kaspiService.deleteFile(file_id);
  }

  @Get('file/:id/products')
  async findOne(@Param('id') file_id: number) {
    return this.kaspiService.findOne(file_id);
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
    return await this.kaspiService.parseAndSave(file);
  }

  @Patch('filter-file/:id')
  async filterFile(@Param('id') file_id: number, @Res() res: Response) {
    try {
      const buffer = await this.kaspiService.filterFile(file_id);

      // Set the appropriate headers for the response
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${uuid()}.xlsx`,
      );

      // Send the buffer as the response body
      res.send(buffer);
    } catch (error) {
      // Handle errors and send an appropriate response
      res.status(500).send('Internal Server Error');
    }
  }

  @Patch('select-product/:id')
  async updateProduct(
    @Param('id') product_id: number,
    @Body() dto: ProductUpdateRequestDto,
  ) {
    Logger.debug(dto);
    return this.kaspiService.updateProduct(product_id, dto);
  }

  @Delete('delete-product/:id')
  async deleteProduct(@Param('id') product_id: number) {
    return this.kaspiService.deleteProduct(product_id);
  }
}
