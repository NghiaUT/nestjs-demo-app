import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.processPayment(
      createPaymentDto.method,
      createPaymentDto.amount,
      createPaymentDto.userId,
    );
  }

  @Post('my-payments/:id')
  getMyPaymentStatistics(@Param('id') userId: string) {
    const data = this.paymentService.aggregateSuccessPayments(userId);
    return data;
  }
}
