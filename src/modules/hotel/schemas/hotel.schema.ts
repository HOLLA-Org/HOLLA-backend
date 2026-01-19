import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HotelDocument = Hotel & Document;

@Schema({ timestamps: true })
export class Hotel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: Number, required: true })
  latitude: number;

  @Prop({ type: Number, required: true })
  longitude: number;

  @Prop({ type: Number, default: 0 })
  priceHour: number;

  @Prop({ type: Number, default: 0 })
  priceDay: number;

  @Prop({ default: 0 })
  totalRooms: number;

  @Prop({ default: 0 })
  availableRooms: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Amenity' }],
    default: [],
  })
  amenities: Types.ObjectId[];
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
