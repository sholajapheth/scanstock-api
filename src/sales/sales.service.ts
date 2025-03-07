// src/sales/sales.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { v4 as uuidv4 } from 'uuid';
import { ProductsService } from '../products/product.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,
    private readonly productsService: ProductsService,
    private readonly activitiesService: ActivitiesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, createSaleDto: CreateSaleDto): Promise<Sale> {
    // Check if the sale has items
    if (!createSaleDto.items || createSaleDto.items.length === 0) {
      throw new BadRequestException('Sale must have at least one item');
    }

    // Start a transaction to ensure all operations are atomic
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the sale
      const sale = this.salesRepository.create({
        total: createSaleDto.total,
        customerName: createSaleDto.customerInfo?.name,
        customerEmail: createSaleDto.customerInfo?.email,
        customerPhone: createSaleDto.customerInfo?.phone,
        notes: createSaleDto.notes,
        paymentMethod: createSaleDto.paymentMethod,
        userId,
        receiptNumber: this.generateReceiptNumber(),
      });

      // Save the sale
      const savedSale = await queryRunner.manager.save(sale);

      // Process each sale item
      for (const itemDto of createSaleDto.items) {
        // Get the product
        const product = await this.productsService.findOne(
          userId,
          itemDto.productId,
        );

        // Calculate subtotal
        const subtotal = itemDto.price * itemDto.quantity;

        // Create and save the sale item
        const saleItem = this.saleItemsRepository.create({
          quantity: itemDto.quantity,
          price: itemDto.price,
          subtotal,
          productName: product.name,
          productBarcode: product.barcode,
          productId: product.id,
          saleId: savedSale.id,
        });

        await queryRunner.manager.save(saleItem);

        // Update the product stock
        await this.productsService.decreaseStock(
          userId,
          product.id,
          itemDto.quantity,
        );
      }

      // Log the sale activity
      await this.activitiesService.logActivity(
        userId,
        'sale',
        `New sale: ${createSaleDto.items.length} items for $${createSaleDto.total.toFixed(2)}`,
        savedSale.id,
        'sale',
        {
          amount: createSaleDto.total,
          quantity: createSaleDto.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
        },
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Return the sale with related items
      return this.findOne(userId, savedSale.id);
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async findAll(userId: number): Promise<Sale[]> {
    return this.salesRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Sale> {
    const sale = await this.salesRepository.findOne({
      where: { id, userId },
      relations: ['items'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async update(
    userId: number,
    id: number,
    updateSaleDto: UpdateSaleDto,
  ): Promise<Sale> {
    const sale = await this.findOne(userId, id);

    // Cannot modify a cancelled or refunded sale
    if (sale.status !== 'completed') {
      throw new BadRequestException(`Cannot modify a ${sale.status} sale`);
    }

    // Update sale fields
    Object.assign(sale, updateSaleDto);

    const updatedSale = await this.salesRepository.save(sale);

    // Log activity
    await this.activitiesService.logActivity(
      userId,
      'sale',
      `Updated sale #${updatedSale.receiptNumber}`,
      updatedSale.id,
      'sale',
      {
        amount: updatedSale.total,
      },
    );

    return updatedSale;
  }

  async cancel(userId: number, id: number): Promise<Sale> {
    const sale = await this.findOne(userId, id);

    // Cannot cancel an already cancelled or refunded sale
    if (sale.status !== 'completed') {
      throw new BadRequestException(`Sale is already ${sale.status}`);
    }

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update sale status
      sale.status = 'cancelled';
      await queryRunner.manager.save(sale);

      // Restore stock for each item
      for (const item of sale.items) {
        if (item.productId) {
          await this.productsService.increaseStock(
            userId,
            item.productId,
            item.quantity,
          );
        }
      }

      // Log activity
      await this.activitiesService.logActivity(
        userId,
        'sale',
        `Cancelled sale #${sale.receiptNumber}`,
        sale.id,
        'sale',
        {
          amount: sale.total,
        },
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      return sale;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async refund(userId: number, id: number): Promise<Sale> {
    const sale = await this.findOne(userId, id);

    // Cannot refund an already cancelled or refunded sale
    if (sale.status !== 'completed') {
      throw new BadRequestException(`Sale is already ${sale.status}`);
    }

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update sale status
      sale.status = 'refunded';
      await queryRunner.manager.save(sale);

      // Restore stock for each item
      for (const item of sale.items) {
        if (item.productId) {
          await this.productsService.increaseStock(
            userId,
            item.productId,
            item.quantity,
          );
        }
      }

      // Log activity
      await this.activitiesService.logActivity(
        userId,
        'sale',
        `Refunded sale #${sale.receiptNumber}`,
        sale.id,
        'sale',
        {
          amount: sale.total,
        },
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      return sale;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  private generateReceiptNumber(): string {
    // Generate a unique receipt number format: REC-{timestamp}-{random}
    const timestamp = new Date().getTime();
    const random = uuidv4().substring(0, 4);
    return `REC-${timestamp}-${random}`;
  }

  async getSaleStatistics(
    userId: number,
    start?: Date,
    end?: Date,
  ): Promise<any> {
    const query = this.salesRepository
      .createQueryBuilder('sale')
      .where('sale.userId = :userId', { userId })
      .andWhere('sale.status = :status', { status: 'completed' });

    if (start) {
      query.andWhere('sale.createdAt >= :start', { start });
    }

    if (end) {
      query.andWhere('sale.createdAt <= :end', { end });
    }

    const totalSales = await query.getCount();
    const totalRevenue = await query
      .select('SUM(sale.total)', 'total')
      .getRawOne();

    return {
      totalSales,
      totalRevenue: totalRevenue?.total || 0,
    };
  }
}
