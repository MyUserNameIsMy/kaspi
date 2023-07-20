import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import readXlsxFile from 'read-excel-file/node';
import { spreadsheetSchema } from './schemas/spreadsheet.schema';
import { FileEntity } from './entities/file.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductUpdateRequestDto } from './dto/product.request.dto';

@Injectable()
export class KaspiService {
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

    const products = await this.getProducts(entry.name);

    return {
      products,
      entry,
      next_id,
    };
  }

  async getProducts(name: string) {
    const search_result_by_name = await this.findByName(name);
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0',
      Referer: 'https://kaspi.kz/shop',
    };
    const products = [];
    for (const item of search_result_by_name) {
      try {
        const res = await lastValueFrom(
          this.httpService.get(item.kaspi_url, { headers }),
        );
        const match = res.data.match(
          /BACKEND\.components\.item\s*=\s*({.*?})\n/,
        );
        const data = JSON.parse(match[1]);
        const { card, galleryImages, specifications } = data;
        products.push({ card, galleryImages, specifications });
      } catch (err) {
        throw new BadRequestException('Error while getting product from kaspi');
      }
    }

    return products;
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
    }).then(({ rows, errors }) => {
      res.push(...rows);
    });
    return res;
  }

  async findByName(name: string) {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0',
      Referer: 'https://kaspi.kz/shop',
    };
    const products = [];
    try {
      const URL = `https://kaspi.kz/yml/product-view/pl/filters?text=${name}`;
      const res = await lastValueFrom(this.httpService.get(URL, { headers }));
      products.push(res.data?.data?.cards.slice(0, 3));
    } catch (err) {
      if (err.message.code === 'ETIMEDOUT') {
        Logger.error('Time');
      }
    }

    return products.flat().map((item) => {
      return {
        name: item.title,
        price: item.unitPrice,
        kaspi_url: item.shopLink,
        created_time: item.createdTime,
        kaspi_id: item.id,
      };
    });
  }
  async parseAndSave(file: Express.Multer.File) {
    const names = await this.parse(file);

    const fileEntity = new FileEntity();
    fileEntity.path = `./uploads/${file.filename}`;
    fileEntity.filename = file.originalname;
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

  async updateProduct(product_id: number, dto: ProductUpdateRequestDto) {
    const product = await ProductEntity.findOne({ where: { id: product_id } });
    product.kaspi_price = dto.kaspi_price;
    product.rating = dto.rating;
    product.kaspi_link = dto.kaspi_link;
    product.review_count = dto.review_count;
    product.suppliers_array = dto.suppliers_array;
    product.suppliers_count = dto.suppliers_count;

    try {
      await product.save();
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return product;
  }
}
