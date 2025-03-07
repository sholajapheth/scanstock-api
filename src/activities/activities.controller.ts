// src/activities/activities.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivitiesService } from './activities.service';
import { Activity, ActivityType } from './entities/activity.entity';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('recent')
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of recent activities',
  })
  async getRecentActivities(
    @Request() req,
    @Query('limit') limit: number = 10,
  ): Promise<Activity[]> {
    return this.activitiesService.getRecentActivities(req.user.id, limit);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get activities for a specific product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of product activities',
  })
  async getProductActivities(
    @Request() req,
    @Param('productId') productId: number,
    @Query('limit') limit: number = 10,
  ): Promise<Activity[]> {
    return this.activitiesService.getProductActivities(
      req.user.id,
      productId,
      limit,
    );
  }

  @Get('sale/:saleId')
  @ApiOperation({ summary: 'Get activities for a specific sale' })
  @ApiParam({ name: 'saleId', description: 'Sale ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of sale activities',
  })
  async getSaleActivities(
    @Request() req,
    @Param('saleId') saleId: number,
    @Query('limit') limit: number = 10,
  ): Promise<Activity[]> {
    return this.activitiesService.getSaleActivities(req.user.id, saleId, limit);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get activities by type' })
  @ApiParam({
    name: 'type',
    description: 'Activity type',
    enum: [
      'sale',
      'stock_increase',
      'stock_decrease',
      'product_added',
      'product_updated',
    ],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of activities by type',
  })
  async getActivitiesByType(
    @Request() req,
    @Param('type') type: ActivityType,
    @Query('limit') limit: number = 10,
  ): Promise<Activity[]> {
    return this.activitiesService.getActivitiesByType(req.user.id, type, limit);
  }
}
