import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
