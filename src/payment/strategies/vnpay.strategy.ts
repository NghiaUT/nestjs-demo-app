import { Injectable } from '@nestjs/common';
import {
  PaymentResult,
  PaymentStrategy,
} from './payment-strategy.interface.js';

@Injectable()
export class VnPayStrategy implements PaymentStrategy {
  async pay(amount: number): Promise<PaymentResult> {
    console.log('Processing payment via VNPay');

    return new Promise((resolve, reject) => {
      const success = true;
      if (success)
        resolve({
          transactionId: 'MOMO' + new Date().toISOString(),
          status: 'PENDING',
          paymentUrl: 'https://momo.example/checkout',
        });
    });
  }
}
