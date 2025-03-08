// src/business/business.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@ApiTags('business')
@ApiBearerAuth('JWT-auth')
@Controller('business')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @ApiOperation({ summary: 'Create business profile' })
  @ApiResponse({
    status: 201,
    description: 'The business profile has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  create(@Request() req, @Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(req.user.id, createBusinessDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get business profile for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the business profile.',
  })
  @ApiResponse({ status: 404, description: 'Business profile not found.' })
  findByOwner(@Request() req) {
    return this.businessService.findByOwner(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update business profile' })
  @ApiResponse({
    status: 200,
    description: 'The business profile has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Business profile not found.' })
  update(@Request() req, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.update(req.user.id, updateBusinessDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete business profile' })
  @ApiResponse({
    status: 200,
    description: 'The business profile has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Business profile not found.' })
  remove(@Request() req) {
    return this.businessService.remove(req.user.id);
  }
}
