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

  @Prop()
  images: string;

  @Prop({ default: 0 })
  rating_count: number;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
