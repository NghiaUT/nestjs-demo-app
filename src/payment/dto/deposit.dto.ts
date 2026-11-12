import { IsEnum, IsNumber, Min } from 'class-validator';
import { PaymentMethod } from '../payment.enum.js';

export class DepositDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(Object.values(PaymentMethod))
  method: PaymentMethod;
}
