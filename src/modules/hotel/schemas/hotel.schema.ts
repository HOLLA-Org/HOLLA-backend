import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HotelDocument = Hotel & Document;

@Schema({ timestamps: true })
export class Hotel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ type: [{ url: String, public_id: String }], default: [] })
  images: { url: string; public_id: string }[];

  @Prop({ default: 0 })
  rating_count: number;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
