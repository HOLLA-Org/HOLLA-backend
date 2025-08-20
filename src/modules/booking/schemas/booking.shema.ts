import { BookingStatus, BookingType } from '@/constant';
import { Room } from '@/modules/room/schemas/room.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: { createdAt: 'booked_at' } })
export class Booking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true })
  room_id: Room;

  @Prop({ required: true })
  check_in: Date;

  @Prop({ required: true })
  check_out: Date;

  @Prop({ type: String, enum: Object.values(BookingType), required: true })
  booking_type: BookingType;

  @Prop({ type: Number, required: true })
  total_price: number;

  @Prop({
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
