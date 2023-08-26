import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { KaspiService } from './kaspi.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import {
  ParsedProductCreateReqDto,
  ProductUpdateReqDto,
} from './dto/product.request.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('kaspi')
@Controller('kaspi')
export class KaspiController {
  constructor(private readonly kaspiService: KaspiService) {}

  @UseGuards(AuthGuard('jwt-user'))
  @ApiBearerAuth()
  @Get()
  async findAllFiles(@Request() req) {
    return this.kaspiService.findAllFiles(req.user.id);
  }

  @Delete('file/:id')
  async deleteFile(@Param('id') file_id: number) {
    return await this.kaspiService.deleteFile(file_id);
  }

  @Get('file/:id/products')
  async findOne(@Param('id') file_id: number) {
    return this.kaspiService.findOne(file_id);
  }

  @Get('file/:id')
  async findOneProduct(
    @Param('id') file_id: number,
    @Query('product_id') product_id: number,
  ) {
    console.log('Created');
    return this.kaspiService.findOneById(file_id, product_id);
  }

  @UseGuards(AuthGuard('jwt-user'))
  @ApiBearerAuth()
  @Post('save-parsed-products')
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
  async saveParsedProducts(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('parsed_products') parsed_products: ParsedProductCreateReqDto[],
  ) {
    return await this.kaspiService.saveParsedProducts(
      req.user.id,
      file,
      JSON.parse(parsed_products.toString()),
    );
  }

  @Post('update-products')
  async filterFile(
    @Body() products: ProductUpdateReqDto[],
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.kaspiService.updateProducts(products);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${uuid()}.xlsx`,
      );
      res.send(buffer);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @Delete('delete-product/:id')
  async deleteProduct(@Param('id') product_id: number) {
    return this.kaspiService.deleteProduct(product_id);
  }
}
