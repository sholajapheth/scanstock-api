import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Wireless Headphones',
    description: 'Name of the product',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 29.99,
    description: 'Price of the product',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: '123456789012',
    description: 'Barcode of the product (must be unique)',
  })
  @IsNotEmpty()
  @IsString()
  barcode: string;

  @ApiPropertyOptional({
    example: 'Wireless Bluetooth headphones with noise cancellation',
    description: 'Description of the product',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantity in stock',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({
    example: 'WH-1000',
    description: 'Stock Keeping Unit (SKU)',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/product-image.jpg',
    description: 'URL to the product image',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the product is marked as favorite',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    example: 5,
    description: 'Quantity at which to reorder the product',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  reorderPoint?: number;

  @ApiPropertyOptional({
    example: 19.99,
    description: 'Cost price of the product',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  costPrice?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the category the product belongs to',
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
