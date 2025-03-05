import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@ApiTags('sales')
@ApiBearerAuth('JWT-auth')
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({
    status: 201,
    description: 'The sale has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or empty sale',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Not enough stock available',
  })
  create(@Request() req, @Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(req.user.id, createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns the list of all sales.' })
  findAll(@Request() req) {
    return this.salesService.findAll(req.user.id);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get sales statistics' })
  @ApiQuery({
    name: 'start',
    required: false,
    description: 'Start date for statistics (ISO format)',
  })
  @ApiQuery({
    name: 'end',
    required: false,
    description: 'End date for statistics (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns sales statistics (counts, totals, etc.).',
  })
  getStatistics(
    @Request() req,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    return this.salesService.getSaleStatistics(req.user.id, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific sale by ID' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({ status: 200, description: 'Returns the sale data.' })
  @ApiResponse({ status: 404, description: 'Sale not found.' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.salesService.findOne(req.user.id, +id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sale' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({
    status: 200,
    description: 'The sale has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot modify a non-completed sale',
  })
  @ApiResponse({ status: 404, description: 'Sale not found.' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    return this.salesService.update(req.user.id, +id, updateSaleDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a sale' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({
    status: 200,
    description: 'The sale has been successfully cancelled.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Sale is already cancelled or refunded',
  })
  @ApiResponse({ status: 404, description: 'Sale not found.' })
  cancel(@Request() req, @Param('id') id: string) {
    return this.salesService.cancel(req.user.id, +id);
  }

  @Patch(':id/refund')
  @ApiOperation({ summary: 'Refund a sale' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({
    status: 200,
    description: 'The sale has been successfully refunded.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Sale is already cancelled or refunded',
  })
  @ApiResponse({ status: 404, description: 'Sale not found.' })
  refund(@Request() req, @Param('id') id: string) {
    return this.salesService.refund(req.user.id, +id);
  }
}
