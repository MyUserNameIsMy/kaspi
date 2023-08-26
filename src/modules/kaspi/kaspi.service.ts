import { BadRequestException, Injectable } from '@nestjs/common';
import { writeFileSchema } from './schemas/spreadsheet.schema';
import { FileEntity } from './entities/file.entity';
import { ProductEntity } from './entities/product.entity';
import {
  ParsedProductCreateReqDto,
  ProductUpdateReqDto,
} from './dto/product.request.dto';
import writeXlsxFile from 'write-excel-file/node';
import {
  findClosestNextValue,
  findNumberOrClosestNext,
} from '../../common/utils/helper.util';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class KaspiService {
  async findAllFiles(user_id: number) {
    return await FileEntity.find({
      relations: ['user'],
      where: {
        user: {
          id: user_id,
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(file_id: number) {
    return await FileEntity.findOne({
      relations: ['products'],
      where: { id: file_id },
    });
  }

  async deleteFile(file_id: number) {
    const file = await this.findOne(file_id);
    if (!file) throw new BadRequestException();
    return await file.remove();
  }

  async findOneById(file_id: number, product_id = 1) {
    if (product_id == -1) return { message: 'Finished' };
    const product_names = await ProductEntity.find({
      relations: ['file'],
      where: {
        file: { id: file_id },
      },
      order: {
        id: 'ASC',
      },
      select: ['id'],
    });

    console.table(product_names);

    const current_id = findNumberOrClosestNext(
      product_names.map((item) => item.id),
      product_id,
    );

    let next_id = findClosestNextValue(
      product_names.map((item) => item.id),
      current_id,
    );

    if (next_id === current_id) next_id = -1;

    const entry = await ProductEntity.findOne({
      where: { id: current_id },
    });

    console.table(entry);
    return {
      entry,
      next_id,
    };
  }

  // async getProduct(name: string) {
  //   const search_result_by_name = await this.findByName(name);
  //   let product;
  //   try {
  //     const res = await lastValueFrom(
  //       this.httpService.get(search_result_by_name.kaspi_link, {
  //         headers: this.HEADERS,
  //       }),
  //     );
  //     const match = res.data.match(/BACKEND\.components\.item\s*=\s*({.*?})\n/);
  //     const data = JSON.parse(match[1]);
  //     const { card, galleryImages, specifications } = data;
  //     const merchants_data = await this.findMerchants(card.id);
  //     card['kaspi_price'] = search_result_by_name.kaspi_price;
  //     card['kaspi_link'] = search_result_by_name.kaspi_link;
  //     product = { card, galleryImages, specifications, merchants_data };
  //   } catch (err) {
  //     throw new BadRequestException('Error while getting product from kaspi');
  //   }
  //
  //   return product;
  // }
  // async findMerchants(kaspi_product_code: string) {
  //   const body = JSON.stringify({
  //     cityId: '750000000',
  //     sort: true,
  //     zoneId: 'Magnum_ZONE5',
  //     installationId: '-1',
  //   });
  //
  //   const merchants = [];
  //   let merchants_count = 0;
  //   try {
  //     const URL = `https://kaspi.kz/yml/offer-view/offers/${kaspi_product_code}`;
  //     const res = await lastValueFrom(
  //       this.httpService.post(URL, body, { headers: this.HEADERS }),
  //     );
  //     merchants.push(res.data?.offers);
  //     merchants_count = res.data?.offersCount;
  //   } catch (err) {
  //     if (err.message.code === 'ETIMEDOUT') {
  //       Logger.error('Time');
  //     }
  //   }
  //   return { merchants_count, merchants: merchants.flat() };
  // }
  async saveParsedProducts(
    user_id: number,
    file: Express.Multer.File,
    parsed_products: ParsedProductCreateReqDto[],
  ) {
    console.table(parsed_products);
    const fileEntity = new FileEntity();
    fileEntity.user = await UserEntity.findOne({ where: { id: user_id } });
    fileEntity.path = `./uploads/${file.filename}`;
    fileEntity.filename = file.originalname;
    fileEntity.product_found_count = parsed_products.length;
    await fileEntity.save();
    const products: ProductEntity[] = [];

    parsed_products.forEach((item) => {
      const product = new ProductEntity();
      product.search_name = item.name;
      product.price = item.price;
      product.file = fileEntity;
      products.push(product);
    });

    return await ProductEntity.save(products);
  }

  async updateProducts(productsDto: ProductUpdateReqDto[]) {
    console.table(productsDto);
    const products = [];
    for (const item of productsDto) {
      const product = await ProductEntity.findOne({
        where: { id: item.product_id },
      });
      product.kaspi_id = item.kaspi_id;
      product.kaspi_name = item.kaspi_name;
      product.kaspi_price = item.kaspi_price;
      product.kaspi_link = item.kaspi_link;
      product.review_count = item.review_count;
      product.rating = item.rating;
      product.created_time = item.created_time;
      product.merchants_count = item.merchants_count;
      products.push(product);
    }
    await ProductEntity.save(products);
    return await this.saveExcel(productsDto);
  }

  async saveExcel(res: any) {
    console.table(res);
    return await writeXlsxFile(res, {
      schema: writeFileSchema,
      buffer: true,
    });
  }

  async deleteProduct(product_id: number) {
    const product = await ProductEntity.findOne({ where: { id: product_id } });

    if (!product) throw new BadRequestException('Product not found');

    return await product.remove();
  }
}
