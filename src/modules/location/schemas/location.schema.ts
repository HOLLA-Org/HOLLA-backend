import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    address: string;

    @Prop({ type: Number })
    latitude: number;

    @Prop({ type: Number })
    longitude: number;

    @Prop({ default: false })
    isPopular: boolean;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
