import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUpdateDto {
  @ApiProperty({
    example: '1.2.0',
    description: 'The version number of the update',
  })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty({
    example: '1.0.0',
    description: 'The minimum version required to use the app',
  })
  @IsNotEmpty()
  @IsString()
  minVersion: string;

  @ApiProperty({
    example:
      'https://play.google.com/store/apps/details?id=com.yourcompany.scanstockpro',
    description: 'The Google Play Store URL for the app',
  })
  @IsNotEmpty()
  @IsString()
  androidUrl: string;

  @ApiProperty({
    example: 'https://apps.apple.com/app/your-app-id',
    description: 'The Apple App Store URL for the app',
  })
  @IsNotEmpty()
  @IsString()
  iosUrl: string;

  @ApiProperty({
    example:
      'Fixed critical inventory tracking bug and improved barcode scanning performance.',
    description: 'Notes about the changes in this release',
  })
  @IsNotEmpty()
  @IsString()
  releaseNotes: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to force users to update to this version',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceUpdate?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this update configuration is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
