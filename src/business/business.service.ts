// src/business/business.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async create(
    userId: number,
    createBusinessDto: CreateBusinessDto,
  ): Promise<Business> {
    const business = this.businessRepository.create({
      ...createBusinessDto,
      ownerId: userId,
    });

    return this.businessRepository.save(business);
  }

  async findByOwner(userId: number): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { ownerId: userId },
    });

    if (!business) {
      throw new NotFoundException(
        `Business not found for user with ID ${userId}`,
      );
    }

    return business;
  }

  async update(
    userId: number,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    const business = await this.findByOwner(userId);

    // Update business fields
    Object.assign(business, updateBusinessDto);

    return this.businessRepository.save(business);
  }

  async remove(userId: number): Promise<void> {
    const business = await this.findByOwner(userId);
    await this.businessRepository.remove(business);
  }
}
