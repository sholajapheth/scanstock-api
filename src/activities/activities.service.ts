// src/activities/activities.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType, EntityType } from './entities/activity.entity';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
  ) {}

  async logActivity(
    userId: number,
    type: ActivityType,
    description: string,
    entityId: number,
    entityType: EntityType,
    additionalData: {
      entityName?: string;
      amount?: number;
      quantity?: number;
    } = {},
  ): Promise<Activity> {
    try {
      const activity = this.activitiesRepository.create({
        userId,
        type,
        description,
        entityId,
        entityType,
        entityName: additionalData.entityName,
        amount: additionalData.amount,
        quantity: additionalData.quantity,
      });

      return await this.activitiesRepository.save(activity);
    } catch (error) {
      this.logger.error(
        `Failed to log activity: ${error.message}`,
        error.stack,
      );
      // Not throwing the error to prevent disrupting main operations
      // if activity logging fails
      return null;
    }
  }

  async getRecentActivities(
    userId: number,
    limit: number = 10,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getProductActivities(
    userId: number,
    productId: number,
    limit: number = 10,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        userId,
        entityId: productId,
        entityType: 'product',
      },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getSaleActivities(
    userId: number,
    saleId: number,
    limit: number = 10,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        userId,
        entityId: saleId,
        entityType: 'sale',
      },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getActivitiesByType(
    userId: number,
    type: ActivityType,
    limit: number = 10,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        userId,
        type,
      },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
