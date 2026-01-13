import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  content?: string;

  @Prop({ default: false })
  is_read: boolean;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop()
  type?: string; // system | profile | order
}

export const NotificationSchema =
  SchemaFactory.createForClass(Notification);
