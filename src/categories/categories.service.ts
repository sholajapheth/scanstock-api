import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(
    userId: number,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      userId,
    });

    return this.categoriesRepository.save(category);
  }

  async findAll(userId: number): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { userId },
      relations: ['products'],
    });
  }

  async findOne(userId: number, id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(
    userId: number,
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(userId, id);

    // Update category fields
    Object.assign(category, updateCategoryDto);

    return this.categoriesRepository.save(category);
  }

  async remove(userId: number, id: number): Promise<void> {
    const category = await this.findOne(userId, id);
    await this.categoriesRepository.remove(category);
  }
}
