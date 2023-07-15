import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import readXlsxFile from 'read-excel-file/node';
import { spreadsheetSchema } from './schemas/spreadsheet.schema';
import { FileEntity } from './entities/file.entity';
import { ProductEntity } from './entities/product.entity';
import * as fs from 'fs';

@Injectable()
export class KaspiService {
  constructor(private readonly httpService: HttpService) {}

  async findAllFiles() {
    return await FileEntity.find();
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

  async findOneById(file_id: number, product_id = 1) {
    if (product_id == -1) return { message: 'Finished' };
    const products = await ProductEntity.find({
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
      products.map((item) => item.id),
      product_id,
    );
    const new_products = products.filter((obj) => obj.id !== current_id);
    const entry = await ProductEntity.findOne({ where: { id: current_id } });
    const product = await this.getProduct(entry.kaspi_url);
    return {
      product,
      entry,
      next_id: this.findNumberOrClosestNext(
        new_products.map((item) => item.id),
        current_id,
      ),
    };
  }

  async getProduct(URL: string) {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0',
      Referer: 'https://kaspi.kz/shop/nur-sultan/c/categories/',
    };
    const res = await lastValueFrom(this.httpService.get(URL, { headers }));
    const match = res.data.match(/BACKEND\.components\.item\s*=\s*({.*?})\n/);
    return JSON.parse(match[1]);
  }

  async getCategories() {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0',
      Referer: 'https://kaspi.kz/shop/nur-sultan/c/categories/',
    };
    const URL =
      'https://kaspi.kz/yml/product-view/pl/filters?q=%3Acategory%3Acategories%3AavailableInZones%3AMagnum_ZONE5&page=0&all=false&fl=true&ui=d&i=-1';
    const response = await lastValueFrom(
      this.httpService.get(URL, { headers }),
    );
    return response.data?.data.treeCategory;
  }

  async parse(file: Express.Multer.File) {
    const res = [];
    await readXlsxFile(file.path, { schema: spreadsheetSchema }).then(
      ({ rows, errors }) => {
        res.push(...rows);
      },
    );
    return res;
  }

  async filterProducts(names: { name: string }[]) {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0',
      Referer: 'https://kaspi.kz/shop/nur-sultan/c/categories/',
    };
    const products = [];
    for (const item of names) {
      const URL = `https://kaspi.kz/yml/product-view/pl/filters?text=${item.name}`;
      const res = await lastValueFrom(this.httpService.get(URL, { headers }));
      products.push(res.data?.data?.cards.slice(0, 3));
    }

    return products.map((product) =>
      product.map((item) => {
        return {
          name: item.title,
          price: item.unitPrice,
          kaspi_url: item.shopLink,
          created_time: item.createdTime,
          kaspi_id: item.id,
        };
      }),
    );
  }
  async parseAndSave(file: Express.Multer.File) {
    const names = await this.parse(file);
    const products = await this.filterProducts(names);
    const fileEntity = new FileEntity();
    fileEntity.path = `./uploads/${file.filename}`;
    fileEntity.filename = file.originalname;
    await fileEntity.save();

    const productsEntity: ProductEntity[] = [];
    products.forEach((product) =>
      product.forEach((item) => {
        const product = new ProductEntity();
        product.file = fileEntity;
        product.name = item.name;
        product.price = item.price;
        product.kaspi_url = item.kaspi_url;
        product.created_time = item.created_time;
        product.kaspi_id = item.kaspi_id;
        productsEntity.push(product);
      }),
    );

    return await ProductEntity.save(productsEntity);
  }
}
