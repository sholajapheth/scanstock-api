import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findLatest(): Promise<AppUpdate | null> {
    const latest = await this.updateRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    return latest.length > 0 ? latest[0] : null;
  }

  async findAll(): Promise<AppUpdate[]> {
    return this.updateRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateData: UpdateUpdateDto): Promise<AppUpdate> {
    await this.updateRepository.update(id, updateData);
    const updated = await this.updateRepository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`Update with ID ${id} not found`);
    }
    return updated;
  }

  async setForceUpdate(id: number, force: boolean): Promise<AppUpdate> {
    await this.updateRepository.update(id, { forceUpdate: force });
    const updated = await this.updateRepository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`Update with ID ${id} not found`);
    }
    return updated;
  }
}
