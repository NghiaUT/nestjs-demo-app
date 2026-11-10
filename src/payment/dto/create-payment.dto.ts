import { IsEnum, IsNumber, Min } from 'class-validator';
import { PaymentMethod } from '../payment-method.enum.js';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber()
  @Min(1)
  amount: number;
}
