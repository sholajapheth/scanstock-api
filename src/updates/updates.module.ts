import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateController } from './update.controller';
import { UpdateService } from './update.service';
import { AppUpdateController } from './app-update.controller';
import { AppUpdate } from './entities/app-update.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppUpdate])],
  controllers: [UpdateController, AppUpdateController],
  providers: [UpdateService],
  exports: [UpdateService],
})
export class UpdatesModule {}
