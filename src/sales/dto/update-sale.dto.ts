import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateSaleDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['cash', 'card', 'other'])
  paymentMethod?: string;

  @IsOptional()
  @IsEnum(['completed', 'cancelled', 'refunded'])
  status?: string;
}
