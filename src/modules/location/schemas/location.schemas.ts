import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class Location {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
