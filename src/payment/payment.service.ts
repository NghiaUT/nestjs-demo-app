import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PAYMENT_STRATEGIES } from './payment.constants.js';
import {
  PaymentResult,
  PaymentStrategy,
} from './strategies/payment-strategy.interface.js';
import { PaymentMethod, PaymentStatus } from './payment.enum.js';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './schema/payment.schema.js';
import { Model, Types } from 'mongoose';
import { AggregationResult } from './types/payment.type.js';
import { User } from '../user/schemas/user.schema.js';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_STRATEGIES)
    private readonly strategies: Map<PaymentMethod, PaymentStrategy>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async processPayment(
    method: PaymentMethod,
    amount: number,
    userId: string,
  ): Promise<PaymentResult> {
    const strategy = this.strategies.get(method);

    if (!strategy) {
      throw new BadRequestException('Phương thức thanh toán không hỗ trợ.');
    }

    const createdPayment = new this.paymentModel({
      amount,
      method,
      status: PaymentStatus.PENDING,
      userId,
    });

    await createdPayment.save();
    return strategy.pay(amount);
  }

  async aggregateSuccessPayments(userId: string): Promise<AggregationResult[]> {
    const objectId = new Types.ObjectId(userId);

    console.log(
      await this.paymentModel.find({ status: PaymentStatus.SUCCESS }),
    );

    return await this.userModel.aggregate([
      {
        $match: {
          _id: objectId,
        },
      },
      {
        $lookup: {
          from: 'payments',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$userId', { $toString: '$$userId' }],
                },
                status: PaymentStatus.SUCCESS,
              },
            },
            { $sort: { createdAt: -1 } },
          ],
          as: 'payments',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          payments: 1,
          totalPaymentsSuccess: { $size: '$payments' },
          totalAmount: { $sum: '$payments.amount' },
        },
      },
    ]);
  }
}
