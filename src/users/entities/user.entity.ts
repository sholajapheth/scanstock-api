// src/users/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Product } from '../../products/entities/product.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Business } from '../../business/entities/business.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Sale, (sale) => sale.user)
  sales: Sale[];

  @OneToOne(() => Business, (business) => business.owner)
  business: Business;

  // Virtual property to get full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
