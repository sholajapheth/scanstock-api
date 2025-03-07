// src/sales/sales.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { ProductsModule } from '../products/products.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem]),
    ProductsModule,
    ActivitiesModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
