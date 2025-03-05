import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CustomerInfoDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Customer name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Customer email',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: '555-123-4567',
    description: 'Customer phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

class SaleItemDto {
  @ApiProperty({
    example: 1,
    description: 'Product ID',
  })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product',
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    example: 29.99,
    description: 'Price of the product at the time of sale',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;
}

export class CreateSaleDto {
  @ApiProperty({
    type: [SaleItemDto],
    description: 'Array of items in the sale',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({
    example: 59.98,
    description: 'Total amount of the sale',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  total: number;

  @ApiPropertyOptional({
    type: CustomerInfoDto,
    description: 'Customer information',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo?: CustomerInfoDto;

  @ApiPropertyOptional({
    example: 'Customer paid with credit card ending in 1234',
    description: 'Additional notes about the sale',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'cash',
    description: 'Payment method',
    enum: ['cash', 'card', 'other'],
    default: 'cash',
  })
  @IsOptional()
  @IsEnum(['cash', 'card', 'other'])
  paymentMethod?: string = 'cash';
}
