import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { SupabaseStorageService } from '../services/SupabaseStorageService';
import { BusinessModule } from '../business/business.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), BusinessModule],
  controllers: [UsersController],
  providers: [UsersService, SupabaseStorageService],
  exports: [UsersService],
})
export class UsersModule {}
