import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.debug(
      `Updating user ${id} with data: ${JSON.stringify(updateUserDto)}`,
    );

    // Validate input data
    if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException('Update data cannot be empty');
    }

    // First check if user exists
    const existingUser = await this.usersRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Exclude password from general updates
    const { password, ...updateData } = updateUserDto;

    try {
      // Update directly using the update method - more efficient than save
      const updateResult = await this.usersRepository.update(id, updateData);
      this.logger.debug(`Update result: ${JSON.stringify(updateResult)}`);

      // Fetch and return the updated user
      const updatedUser = await this.usersRepository.findOne({ where: { id } });
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user ${id}:`, error.stack);

      // Improved error handling
      if (error.code === '23505') {
        // Unique constraint violation
        throw new BadRequestException('A user with this email already exists');
      }

      throw error;
    }
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.findById(id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return false;
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return true;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }
}
