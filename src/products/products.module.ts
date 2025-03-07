// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductsService } from './product.service';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), ActivitiesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
