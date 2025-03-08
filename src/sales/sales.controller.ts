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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Request() req, @Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(req.user.id, createSaleDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('dateFilter') dateFilter?: string,
    @Query('status') status?: string,
  ) {
    return this.salesService.findAll(req.user.id, {
      search,
      dateFilter,
      status,
    });
  }

  @Get('statistics')
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
  findOne(@Request() req, @Param('id') id: string) {
    return this.salesService.findOne(req.user.id, +id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    return this.salesService.update(req.user.id, +id, updateSaleDto);
  }

  @Patch(':id/cancel')
  cancel(@Request() req, @Param('id') id: string) {
    return this.salesService.cancel(req.user.id, +id);
  }

  @Patch(':id/refund')
  refund(@Request() req, @Param('id') id: string) {
    return this.salesService.refund(req.user.id, +id);
  }
}
