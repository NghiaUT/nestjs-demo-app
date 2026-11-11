import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { PaymentController } from './payment.controller.js';
import { VnPayStrategy } from './strategies/vnpay.strategy.js';
import { MoMoStrategy } from './strategies/momo.strategy.js';
import { StripeStrategy } from './strategies/stripe.strategy.js';
import { PaymentMethod } from './payment.enum.js';
import { PaymentStrategy } from './strategies/payment-strategy.interface.js';
import { PAYMENT_STRATEGIES } from './payment.constants.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schema/payment.schema.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    UserModule,
  ],
  controllers: [PaymentController],
  providers: [
    VnPayStrategy,
    MoMoStrategy,
    StripeStrategy,
    {
      provide: PAYMENT_STRATEGIES,
      useFactory: (
        vnpay: VnPayStrategy,
        momo: MoMoStrategy,
        stripe: StripeStrategy,
      ) => {
        return new Map<PaymentMethod, PaymentStrategy>([
          [PaymentMethod.VNPAY, vnpay],
          [PaymentMethod.MOMO, momo],
          [PaymentMethod.STRIPE, stripe],
        ]);
      },
      inject: [VnPayStrategy, MoMoStrategy, StripeStrategy],
    },
    PaymentService,
  ],
})
export class PaymentModule {}
