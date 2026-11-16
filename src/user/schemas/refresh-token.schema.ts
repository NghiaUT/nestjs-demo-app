import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<RefreshToken>;

@Schema({
  timestamps: true,
})
export class RefreshToken {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  refreshHash: string;

  @Prop({ default: false })
  revoked: boolean;
}

export const RefreshSchema = SchemaFactory.createForClass(RefreshToken);
