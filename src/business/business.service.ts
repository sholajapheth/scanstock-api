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

  async findByOwnerId(userId: number): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { ownerId: userId },
    });
    if (!business) {
      return null;
    }

    return business;
  }

  async findById(id: number): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException(`Business not found for ID ${id}`);
    }

    return business;
  }

  async update(
    userId: number,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    let business: Business;

    try {
      business = await this.findByOwner(userId);
    } catch (error) {
      // Check if the error is specifically about not finding a business for this user
      if (
        error instanceof NotFoundException &&
        error.message.includes(`Business not found for user with ID ${userId}`)
      ) {
        // If no business exists for the user, create a new one
        business = this.businessRepository.create({
          ...updateBusinessDto,
          ownerId: userId,
        });
        return this.businessRepository.save(business);
      }

      // If it's a different error, rethrow it
      throw error;
    }

    // Update business fields if business exists
    Object.assign(business, updateBusinessDto);

    return this.businessRepository.save(business);
  }

  async remove(userId: number): Promise<void> {
    const business = await this.findByOwner(userId);
    await this.businessRepository.remove(business);
  }
}
