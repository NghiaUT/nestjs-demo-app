import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PAYMENT_STRATEGIES } from './payment.constants.js';
import {
  PaymentResult,
  PaymentStrategy,
} from './strategies/payment-strategy.interface.js';
import { PaymentMethod } from './payment-method.enum.js';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_STRATEGIES)
    private readonly strategies: Map<PaymentMethod, PaymentStrategy>,
  ) {}

  async processPayment(
    method: PaymentMethod,
    amount: number,
  ): Promise<PaymentResult> {
    const strategy = this.strategies.get(method);

    if (!strategy) {
      throw new BadRequestException('Phương thức thanh toán không hỗ trợ.');
    }

    return strategy.pay(amount);
  }
}
