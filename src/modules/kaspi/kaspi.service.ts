import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import readXlsxFile from 'read-excel-file/node';
import {
  spreadsheetSchema,
  writeFileSchema,
} from './schemas/spreadsheet.schema';
import { FileEntity } from './entities/file.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductUpdateRequestDto } from './dto/product.request.dto';
import * as distance from 'jaro-winkler';
import writeXlsxFile from 'write-excel-file/node';

@Injectable()
export class KaspiService {
  HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent':
      'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    Referer: 'https://kaspi.kz/shop',
  };
  constructor(private readonly httpService: HttpService) {}

  findClosestNextValue(array: number[], target: number) {
    let left = 0;
    let right = array.length - 1;
    let result = null;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (array[mid] <= target) {
        left = mid + 1;
      } else {
        result = array[mid];
        right = mid - 1;
      }
    }

    return result;
  }
  findNumberOrClosestNext(array: number[], target: number) {
    let left = 0;
    let right = array.length - 1;
    let result = null;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const current = array[mid];

      if (current === target) {
        return current;
      }
      if (current > target) {
        result = current;
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return result;
  }

  async findAllFiles() {
    return await FileEntity.find();
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

    const current_id = this.findNumberOrClosestNext(
      product_names.map((item) => item.id),
      product_id,
    );

    let next_id = this.findClosestNextValue(
      product_names.map((item) => item.id),
      current_id,
    );

    if (next_id === current_id) next_id = -1;

    const entry = await ProductEntity.findOne({
      where: { id: current_id },
    });

    const product = await this.getProduct(entry.name);
    return {
      product,
      entry,
      next_id,
    };
  }

  async getProduct(name: string) {
    const search_result_by_name = await this.findByName(name);
    let product;
    try {
      const res = await lastValueFrom(
        this.httpService.get(search_result_by_name.kaspi_link, {
          headers: this.HEADERS,
        }),
      );
      const match = res.data.match(/BACKEND\.components\.item\s*=\s*({.*?})\n/);
      const data = JSON.parse(match[1]);
      const { card, galleryImages, specifications } = data;
      const merchants_data = await this.findMerchants(card.id);
      card['kaspi_price'] = search_result_by_name.kaspi_price;
      card['kaspi_link'] = search_result_by_name.kaspi_link;
      product = { card, galleryImages, specifications, merchants_data };
    } catch (err) {
      throw new BadRequestException('Error while getting product from kaspi');
    }

    return product;
  }

  async findByName(name: string) {
    let product = null;
    try {
      const URL = encodeURI(
        `https://kaspi.kz/yml/product-view/pl/filters?text=${name}`,
      );
      const res = await lastValueFrom(
        this.httpService.get(URL, { headers: this.HEADERS }),
      );
      product = res.data?.data?.cards?.slice(0, 1).flat();
    } catch (err) {
      if (err.message.code === 'ETIMEDOUT') {
        Logger.error(`ETIMEDOUT for search${name}`);
      }
      Logger.error(err.message);
    }

    if (!product) return null;
    return {
      search_name: name,
      kaspi_name: product[0]?.title,
      kaspi_price: product[0]?.unitPrice,
      kaspi_link: product[0]?.shopLink,
      created_time: product[0]?.createdTime,
      kaspi_id: product[0]?.id,
    };
  }
  async findMerchants(kaspi_product_code: string) {
    const body = JSON.stringify({
      cityId: '750000000',
      sort: true,
      zoneId: 'Magnum_ZONE5',
      installationId: '-1',
    });

    const merchants = [];
    let merchants_count = 0;
    try {
      const URL = `https://kaspi.kz/yml/offer-view/offers/${kaspi_product_code}`;
      const res = await lastValueFrom(
        this.httpService.post(URL, body, { headers: this.HEADERS }),
      );
      merchants.push(res.data?.offers);
      merchants_count = res.data?.offersCount;
    } catch (err) {
      if (err.message.code === 'ETIMEDOUT') {
        Logger.error('Time');
      }
    }
    return { merchants_count, merchants: merchants.flat() };
  }
  async parse(file: Express.Multer.File) {
    const res = [];
    await readXlsxFile(file.path, {
      schema: spreadsheetSchema,
      transformData(data) {
        return data.filter(
          (row) => row.filter((column) => column !== null).length > 0,
        );
      },
    }).then(({ rows }) => {
      res.push(...rows);
    });
    return res;
  }
  async parseAndSave(file: Express.Multer.File) {
    const names = await this.parse(file);

    const fileEntity = new FileEntity();
    fileEntity.path = `./uploads/${file.filename}`;
    fileEntity.filename = file.originalname;
    fileEntity.product_found_count = names.length;
    await fileEntity.save();
    const products: ProductEntity[] = [];

    names.forEach((item) => {
      const product = new ProductEntity();
      product.name = item.name;
      product.price = item.price;
      product.file = fileEntity;
      products.push(product);
    });

    return await ProductEntity.save(products);
  }

  async filterFile(file_id: number) {
    const file = await this.findOne(file_id);
    let res = [];

    for (const item of file?.products) {
      const product = await this.findByName(item.name);
      product['price'] = item.price;
      product['product_id'] = item.id;
      res.push(product);
    }

    res.filter((item) => {
      if (!item) return false;
      const similarity = distance(item.kaspi_name, item.search_name, {
        caseSensitive: false,
      });
      return similarity >= 0.5;
    });

    res = res.map((item) => {
      const margin_kzt =
        item.kaspi_price - item.price - 2000 - 0.15 * item.kaspi_price;
      return {
        ...item,
        margin_kzt,
        margin_percent: item.price ? (margin_kzt / item.price) * 100 : 100,
      };
    });

    return await this.saveExcel(res);
  }

  async saveExcel(res: any) {
    return await writeXlsxFile(res, {
      schema: writeFileSchema,
      buffer: true,
    });
  }
  async updateProduct(product_id: number, dto: ProductUpdateRequestDto) {
    console.log(dto);
    const product = await ProductEntity.findOne({ where: { id: product_id } });
    product.kaspi_price = dto.kaspi_price;
    product.rating = dto.rating;
    product.kaspi_link = dto.kaspi_link;
    product.review_count = dto.review_count;
    product.merchants_array = dto.merchants_array;
    product.merchants_count = dto.merchants_count;

    try {
      await product.save();
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return product;
  }

  async deleteProduct(product_id: number) {
    const product = await ProductEntity.findOne({ where: { id: product_id } });

    if (!product) throw new BadRequestException('Product not found');

    return await product.remove();
  }
}
