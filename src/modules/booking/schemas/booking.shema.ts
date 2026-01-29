import { BookingStatus, BookingType } from '@/constant';
import { Hotel } from '@/modules/hotel/schemas/hotel.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: { createdAt: 'booked_at' } })
export class Booking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true })
  hotel_id: Types.ObjectId;

  @Prop({ required: true })
  check_in: Date;

  @Prop({ required: true })
  check_out: Date;

  @Prop({ type: String, enum: Object.values(BookingType), required: true })
  booking_type: BookingType;

  @Prop({ type: Number, required: true })
  total_price: number;

  @Prop()
  paid_amount?: number;

  @Prop({
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Prop({ type: Date, required: true })
  expires_at: Date;

  booked_at: Date;
  updatedAt: Date;
}


export const BookingSchema = SchemaFactory.createForClass(Booking);
