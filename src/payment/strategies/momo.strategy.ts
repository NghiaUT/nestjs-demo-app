import { Injectable } from '@nestjs/common';
import {
  PaymentResult,
  PaymentStrategy,
} from './payment-strategy.interface.js';
import { timeout } from '../../utils/db-mock.connection.js';

@Injectable()
export class MoMoStrategy implements PaymentStrategy {
  async pay(amount: number): Promise<PaymentResult> {
    console.log('Processing payment via MoMo');

    // Sample of create url to momo.
    await timeout(1000);

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
