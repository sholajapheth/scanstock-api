// src/business/dto/update-business.dto.ts
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBusinessDto {
  @ApiPropertyOptional({
    example: 'Updated Store Name',
    description: 'Updated name of the business',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/new-logo.png',
    description: 'Updated URL to the business logo',
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    example: '456 New St',
    description: 'Updated business address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Chicago',
    description: 'Updated business city',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'IL',
    description: 'Updated business state',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    example: '60601',
    description: 'Updated business postal code',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'USA',
    description: 'Updated business country',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: '555-987-6543',
    description: 'Updated business phone number',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'https://newwebsite.com',
    description: 'Updated business website',
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    example: '98-7654321',
    description: 'Updated business tax ID',
  })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({
    example: 'We now sell premium electronics and accessories.',
    description: 'Updated business description',
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

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the business is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
