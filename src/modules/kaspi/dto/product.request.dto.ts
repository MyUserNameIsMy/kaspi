import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class ProductUpdateRequestDto {
  @ApiProperty({
    type: Number,
    description: 'The price from Kaspi',
    nullable: true,
  })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'Invalid price value' },
  )
  @Min(0, { message: 'Price must be non-negative' })
  @IsOptional()
  kaspi_price: number;

  @ApiProperty({
    type: Number,
    description: 'The rating of the product',
    nullable: true,
  })
  @IsNumber({}, { message: 'Invalid rating value' })
  @IsOptional()
  rating: number;

  @ApiProperty({
    type: Number,
    description: 'The number of reviews for the product',
    nullable: true,
  })
  @IsInt({ message: 'Review count must be an integer' })
  @IsOptional()
  review_count: number;

  @ApiProperty({
    type: String,
    description: 'The Kaspi link of the product',
    nullable: true,
  })
  @IsString({ message: 'Invalid Kaspi link' })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid URL format for Kaspi link' })
  kaspi_link: string;

  @ApiProperty({
    type: Number,
    description: 'The number of suppliers for the product',
    nullable: true,
  })
  @IsInt({ message: 'Suppliers count must be an integer' })
  @IsOptional()
  merchants_count: number;

  @ApiProperty({
    type: [String],
    description: 'Array of suppliers',
    nullable: true,
  })
  @IsOptional()
  merchants_array: string;
}
