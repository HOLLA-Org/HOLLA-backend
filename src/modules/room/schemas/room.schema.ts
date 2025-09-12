import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({ timestamps: true })
export class Room {
  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotel_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: ['Standard', 'Deluxe'], required: true })
  type: string;

  @Prop({ required: true })
  price_per_hour: number;

  @Prop({ required: true })
  price_per_day: number;

  @Prop({ required: true })
  price_overnight: number;

  @Prop({ default: true })
  is_available: boolean;

  @Prop({ type: [{ url: String, public_id: String }], default: [] })
  images: { url: string; public_id: string }[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
