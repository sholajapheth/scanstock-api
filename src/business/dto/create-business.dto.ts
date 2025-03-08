// src/business/dto/create-business.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({
    example: 'My Store',
    description: 'Name of the business',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'URL to the business logo',
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    example: '123 Main St',
    description: 'Business address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'New York',
    description: 'Business city',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'NY',
    description: 'Business state',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    example: '10001',
    description: 'Business postal code',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'USA',
    description: 'Business country',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: '555-123-4567',
    description: 'Business phone number',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'https://mybusiness.com',
    description: 'Business website',
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    example: '12-3456789',
    description: 'Business tax ID',
  })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({
    example: 'We sell premium electronics.',
    description: 'Business description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Retail',
    description: 'Business industry category',
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    example: 'Specialty Coffee Shop',
    description: 'Custom business industry when "Other" is selected',
  })
  @IsOptional()
  @IsString()
  customIndustry?: string;
}
