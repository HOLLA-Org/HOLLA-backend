// src/media/schemas/media.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  publicId: string;

  @Prop({ required: true })
  secureUrl: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  owner_id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Hotel' })
  hotel_id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Room' })
  room_id: Types.ObjectId;
}
export const MediaSchema = SchemaFactory.createForClass(Media);
