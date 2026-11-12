import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PaymentMethod, PaymentStatus, PaymentType } from '../payment.enum.js';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, enum: Object.values(PaymentMethod) })
  method: PaymentMethod;

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ required: true, trim: true })
  userId: string;

  @Prop({
    required: true,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({
    required: true,
    enum: Object.values(PaymentType),
    default: PaymentType.PAY,
  })
  type: PaymentType;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
