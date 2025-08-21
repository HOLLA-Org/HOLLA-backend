import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  booking_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Discount' })
  discount_id: Types.ObjectId;

  @Prop({ required: true })
  payment_method: string;

  @Prop({ required: true, default: 'Pending' })
  booking_status: string;

  @Prop({ required: true })
  amount: number;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
