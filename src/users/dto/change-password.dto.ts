// src/users/dto/change-password.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentpassword123',
    description: 'Current password of the user',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password (min 6 characters)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
