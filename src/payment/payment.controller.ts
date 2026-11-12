import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { TransferMoneyDto } from './dto/transfer-payment.dto.js';
import { DepositDto } from './dto/deposit.dto.js';
import { WithdrawDto } from './dto/withdraw.dto.js';

@Controller('payments')
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

  @Post('transfer')
  transfer(@Body() transferDto: TransferMoneyDto) {
    return this.paymentService.transferMoney(
      transferDto.senderId,
      transferDto.receiverId,
      transferDto.amount,
      transferDto.method,
    );
  }

  @Post('deposit/:id')
  deposit(@Param('id') userId: string, @Body() depositDto: DepositDto) {
    return this.paymentService.deposit(
      userId,
      depositDto.amount,
      depositDto.method,
    );
  }

  @Post('withdraw/:id')
  withdraw(@Param('id') userId: string, @Body() withdrawDto: WithdrawDto) {
    return this.paymentService.withdraw(
      userId,
      withdrawDto.amount,
      withdrawDto.method,
    );
  }
}
