import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductUpdateRequestDto {
  @ApiProperty()
  @IsNumber()
  product_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  search_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  kaspi_name: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  kaspi_price: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  kaspi_id: number;

  @ApiProperty()
  @IsOptional()
  created_time: Date;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  rating: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  review_count: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  margin_kzt: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  margin_percent: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  kaspi_link: string;
}
