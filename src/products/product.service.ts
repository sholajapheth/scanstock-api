// src/products/product.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(
    userId: number,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    // Check if barcode already exists for this user
    const existingProduct = await this.productsRepository.findOne({
      where: { barcode: createProductDto.barcode, userId },
    });

    if (existingProduct) {
      throw new ConflictException('A product with this barcode already exists');
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      userId,
    });

    const savedProduct = await this.productsRepository.save(product);

    // Log activity
    await this.activitiesService.logActivity(
      userId,
      'product_added',
      `Added new product: ${savedProduct.name}`,
      savedProduct.id,
      'product',
      {
        entityName: savedProduct.name,
      },
    );

    return savedProduct;
  }

  async findAll(userId: number): Promise<Product[]> {
    return this.productsRepository.find({
      where: { userId },
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByBarcode(userId: number, barcode: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { barcode, userId },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }

    return product;
  }

  async update(
    userId: number,
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(userId, id);

    // Update product fields
    Object.assign(product, updateProductDto);

    const updatedProduct = await this.productsRepository.save(product);

    // Log activity
    await this.activitiesService.logActivity(
      userId,
      'product_updated',
      `Updated product: ${updatedProduct.name}`,
      updatedProduct.id,
      'product',
      {
        entityName: updatedProduct.name,
      },
    );

    return updatedProduct;
  }

  async remove(userId: number, id: number): Promise<void> {
    const product = await this.findOne(userId, id);
    const productName = product.name;

    await this.productsRepository.remove(product);

    // Log activity
    await this.activitiesService.logActivity(
      userId,
      'product_updated',
      `Deleted product: ${productName}`,
      id,
      'product',
      {
        entityName: productName,
      },
    );
  }

  async decreaseStock(
    userId: number,
    id: number,
    quantity: number,
  ): Promise<Product> {
    const product = await this.findOne(userId, id);

    if (product.quantity < quantity) {
      throw new ConflictException('Not enough stock available');
    }

    product.quantity -= quantity;

    const updatedProduct = await this.productsRepository.save(product);

    // Log activity
    await this.activitiesService.logActivity(
      userId,
      'stock_decrease',
      `Decreased stock of ${product.name} by ${quantity}`,
      product.id,
      'product',
      {
        entityName: product.name,
        quantity: quantity,
      },
    );

    return updatedProduct;
  }

  async increaseStock(
    userId: number,
    id: number,
    quantity: number,
  ): Promise<Product> {
    const product = await this.findOne(userId, id);

    product.quantity += quantity;

    const updatedProduct = await this.productsRepository.save(product);

    // Log activity
    await this.activitiesService.logActivity(
      userId,
      'stock_increase',
      `Increased stock of ${product.name} by ${quantity}`,
      product.id,
      'product',
      {
        entityName: product.name,
        quantity: quantity,
      },
    );

    return updatedProduct;
  }

  // Rest of your existing methods...
  async getLowStockProducts(userId: number): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.userId = :userId', { userId })
      .andWhere('product.quantity <= product.reorderPoint')
      .andWhere('product.quantity > 0')
      .andWhere('product.isActive = true')
      .orderBy('product.quantity', 'ASC')
      .getMany();
  }

  async getOutOfStockProducts(userId: number): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.userId = :userId', { userId })
      .andWhere('product.quantity = 0')
      .andWhere('product.isActive = true')
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  async getFavoriteProducts(userId: number): Promise<Product[]> {
    return this.productsRepository.find({
      where: { userId, isFavorite: true, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getProductsByCategory(
    userId: number,
    categoryId: number,
  ): Promise<Product[]> {
    return this.productsRepository.find({
      where: { userId, categoryId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async searchProducts(userId: number, query: string): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.userId = :userId', { userId })
      .andWhere('product.isActive = true')
      .andWhere(
        '(LOWER(product.name) LIKE LOWER(:query) OR LOWER(product.barcode) LIKE LOWER(:query) OR LOWER(product.sku) LIKE LOWER(:query))',
        { query: `%${query}%` },
      )
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  async toggleFavorite(userId: number, id: number): Promise<Product> {
    const product = await this.findOne(userId, id);

    product.isFavorite = !product.isFavorite;

    const updatedProduct = await this.productsRepository.save(product);

    // Log activity
    await this.activitiesService.logActivity(
      userId,
      'product_updated',
      `${updatedProduct.isFavorite ? 'Added' : 'Removed'} ${product.name} ${updatedProduct.isFavorite ? 'to' : 'from'} favorites`,
      product.id,
      'product',
      {
        entityName: product.name,
      },
    );

    return updatedProduct;
  }

  async getProductStats(userId: number): Promise<any> {
    const totalProducts = await this.productsRepository.count({
      where: { userId, isActive: true },
    });

    const lowStockCount = await this.productsRepository.count({
      where: {
        userId,
        isActive: true,
        quantity: Raw((alias) => `${alias} > 0 AND ${alias} <= reorderPoint`),
      },
    });

    const outOfStockCount = await this.productsRepository.count({
      where: { userId, isActive: true, quantity: 0 },
    });

    const totalStock = await this.productsRepository
      .createQueryBuilder('product')
      .select('SUM(product.quantity)', 'total')
      .where('product.userId = :userId', { userId })
      .andWhere('product.isActive = true')
      .getRawOne();

    const totalValue = await this.productsRepository
      .createQueryBuilder('product')
      .select('SUM(product.quantity * product.price)', 'total')
      .where('product.userId = :userId', { userId })
      .andWhere('product.isActive = true')
      .getRawOne();

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalStock: totalStock?.total || 0,
      totalValue: totalValue?.total || 0,
    };
  }
}
