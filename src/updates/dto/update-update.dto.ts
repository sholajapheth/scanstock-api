import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUpdateDto {
  @ApiPropertyOptional({
    example: '1.2.0',
    description: 'The version number of the update',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    example: '1.0.0',
    description: 'The minimum version required to use the app',
  })
  @IsOptional()
  @IsString()
  minVersion?: string;

  @ApiPropertyOptional({
    example:
      'https://play.google.com/store/apps/details?id=com.yourcompany.scanstockpro',
    description: 'The Google Play Store URL for the app',
  })
  @IsOptional()
  @IsString()
  androidUrl?: string;

  @ApiPropertyOptional({
    example: 'https://apps.apple.com/app/your-app-id',
    description: 'The Apple App Store URL for the app',
  })
  @IsOptional()
  @IsString()
  iosUrl?: string;

  @ApiPropertyOptional({
    example:
      'Fixed critical inventory tracking bug and improved barcode scanning performance.',
    description: 'Notes about the changes in this release',
  })
  @IsOptional()
  @IsString()
  releaseNotes?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to force users to update to this version',
  })
  @IsOptional()
  @IsBoolean()
  forceUpdate?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this update configuration is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
