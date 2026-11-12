import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../payment.enum.js';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  userId: string;
}
