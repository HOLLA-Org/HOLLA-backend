import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AmenityDocument = Amenity & Document;

@Schema({ timestamps: true })
export class Amenity {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: '' })
  icon: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const AmenitySchema = SchemaFactory.createForClass(Amenity);
