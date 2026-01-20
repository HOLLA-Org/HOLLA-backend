import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Hotel' })
  hotel_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Booking' })
  booking_id: Types.ObjectId;

  @Prop({ required: true })
  rating: number;

  @Prop()
  comment: string;

  @Prop({ default: Date.now })
  review_date: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ booking_id: 1, user_id: 1 }, { unique: true });