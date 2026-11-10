import { Injectable } from '@nestjs/common';
import {
  PaymentResult,
  PaymentStrategy,
} from './payment-strategy.interface.js';

@Injectable()
export class StripeStrategy implements PaymentStrategy {
  async pay(amount: number): Promise<PaymentResult> {
    console.log('Processing payment via Stripe');

    return {
      transactionId: 'STRIPE123',
      status: 'SUCCESS',
    };
  }
}
