import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUpdate } from './entities/app-update.entity';
import { CreateUpdateDto } from './dto/create-update.dto';
import { UpdateUpdateDto } from './dto/update-update.dto';

@Injectable()
export class UpdateService {
  constructor(
    @InjectRepository(AppUpdate)
    private readonly updateRepository: Repository<AppUpdate>,
  ) {}

  async create(createUpdateDto: CreateUpdateDto): Promise<AppUpdate> {
    const update = this.updateRepository.create(createUpdateDto);
    return this.updateRepository.save(update);
  }

  async findLatest(): Promise<AppUpdate> {
    return this.updateRepository.findOne({
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<AppUpdate[]> {
    return this.updateRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateData: UpdateUpdateDto): Promise<AppUpdate> {
    await this.updateRepository.update(id, updateData);
    return this.updateRepository.findOne({ where: { id } });
  }

  async setForceUpdate(id: number, force: boolean): Promise<AppUpdate> {
    await this.updateRepository.update(id, { forceUpdate: force });
    return this.updateRepository.findOne({ where: { id } });
  }
}
