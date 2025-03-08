import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('app_updates')
export class AppUpdate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  version: string;

  @Column()
  minVersion: string;

  @Column()
  androidUrl: string;

  @Column()
  iosUrl: string;

  @Column()
  releaseNotes: string;

  @Column({ default: false })
  forceUpdate: boolean;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
