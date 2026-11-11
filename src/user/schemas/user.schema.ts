import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Department } from '../entities/user.entity.js';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, min: 0, max: 90 })
  age: number;

  @Prop({ required: true, enum: Object.values(Department) })
  department: Department;

  @Prop({ default: false })
  isManager: boolean;

  @Prop({ required: true, select: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
