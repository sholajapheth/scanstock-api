import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateService } from './update.service';

@ApiTags('updates')
@Controller('updates')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @Get()
  @ApiOperation({ summary: 'Get app update configuration' })
  @ApiResponse({
    status: 200,
    description:
      'Returns app update configuration with minimum required version.',
    schema: {
      properties: {
        minVersion: { type: 'string', example: '1.0.0' },
        latestVersion: { type: 'string', example: '1.2.0' },
        updateUrl: {
          type: 'string',
          example:
            'https://play.google.com/store/apps/details?id=com.yourcompany.scanstockpro',
        },
        releaseNotes: {
          type: 'string',
          example: 'Bug fixes and performance improvements',
        },
        forceUpdate: { type: 'boolean', example: false },
      },
    },
  })
  async getUpdateConfig(@Req() request: Request) {
    // Detect platform from user agent
    const userAgent = request.headers['user-agent'] || '';
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);

    // Get the latest active update configuration from the database
    const latestUpdate = await this.updateService.findLatest();

    if (!latestUpdate) {
      // Fallback if no update configuration exists
      return {
        minVersion: process.env.UPDATE_MIN_VERSION,
        latestVersion: process.env.UPDATE_LATEST_VERSION,
        updateUrl: isIOS
          ? process.env.UPDATE_IOS_URL
          : process.env.UPDATE_ANDROID_URL,
        releaseNotes: 'Welcome to ScanStock Pro!',
        forceUpdate: false,
      };
    }

    return {
      minVersion: latestUpdate.minVersion,
      latestVersion: latestUpdate.version,
      updateUrl: isIOS ? latestUpdate.iosUrl : latestUpdate.androidUrl,
      releaseNotes: latestUpdate.releaseNotes,
      forceUpdate: latestUpdate.forceUpdate,
    };
  }
}
