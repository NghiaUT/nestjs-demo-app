import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PAYMENT_STRATEGIES } from './payment.constants.js';
import {
  PaymentResult,
  PaymentStrategy,
} from './strategies/payment-strategy.interface.js';
import { PaymentMethod, PaymentStatus, PaymentType } from './payment.enum.js';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Payment } from './schema/payment.schema.js';
import { type Connection, Model, Types } from 'mongoose';
import { AggregationResult } from './types/payment.type.js';
import { User } from '../user/schemas/user.schema.js';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_STRATEGIES)
    private readonly strategies: Map<PaymentMethod, PaymentStrategy>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectConnection() private readonly connection: Connection,
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

  async withdraw(userId: string, amount: number, method: PaymentMethod) {
    const session = await this.connection.startSession();

    try {
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(userId),
            balance: { $gte: amount },
          },
          {
            $inc: { balance: -amount },
          },
          { session },
        )
        .select('-password');

      if (!updatedUser)
        throw new BadRequestException('Không tìm thấy người dùng.');

      const [payment] = await this.paymentModel.create(
        [
          {
            userId,
            amount,
            method,
            type: PaymentType.WITHDRAW,
            status: PaymentStatus.SUCCESS,
          },
        ],
        { session },
      );

      return { remaining: updatedUser.balance - amount };
    } finally {
      await session.endSession();
    }
  }

  async deposit(userId: string, amount: number, method: PaymentMethod) {
    const session = await this.connection.startSession();

    try {
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(userId),
          },
          {
            $inc: { balance: amount },
          },
          { session },
        )
        .select('-password');

      if (!updatedUser)
        throw new BadRequestException('Không tìm thấy người dùng.');

      const [payment] = await this.paymentModel.create(
        [
          {
            userId,
            amount,
            method,
            type: PaymentType.DEPOSIT,
            status: PaymentStatus.SUCCESS,
          },
        ],
        { session },
      );

      return { remaining: updatedUser.balance + amount };
    } finally {
      await session.endSession();
    }
  }

  async transferMoney(
    senderId: string,
    receiverId: string,
    amount: number,
    method: PaymentMethod,
  ): Promise<Payment | null> {
    const session = await this.connection.startSession();

    try {
      let payment: Payment | null = null;
      await session.withTransaction(async () => {
        //1. Trừ tiền người gửi.
        const sender = await this.userModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(senderId),
            balance: { $gte: amount },
          },
          {
            $inc: { balance: -amount },
          },
          { session },
        );

        if (!sender)
          throw new BadRequestException(
            'Số dư tài khoản không đủ hoặc không tìm thấy người gửi.',
          );

        const receiver = await this.userModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(receiverId),
          },
          {
            $inc: { balance: amount },
          },
          { session },
        );

        if (!receiver)
          throw new BadRequestException('Không tìm thấy người nhận');

        [payment] = await this.paymentModel.create(
          [
            {
              userId: senderId,
              amount,
              type: PaymentType.TRANSFER,
              status: PaymentStatus.SUCCESS,
              method,
            },
          ],
          { session },
        );
      });

      return payment;
    } finally {
      await session.endSession();
    }
  }
}
