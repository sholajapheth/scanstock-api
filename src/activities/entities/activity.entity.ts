// src/activities/entities/activity.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type ActivityType =
  | 'sale'
  | 'stock_increase'
  | 'stock_decrease'
  | 'product_added'
  | 'product_updated';

export type EntityType = 'product' | 'sale';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: [
      'sale',
      'stock_increase',
      'stock_decrease',
      'product_added',
      'product_updated',
    ],
  })
  type: ActivityType;

  @Column()
  description: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  entityId: number;

  @Column({
    type: 'enum',
    enum: ['product', 'sale'],
  })
  entityType: EntityType;

  @Column({ nullable: true })
  entityName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  quantity: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}
