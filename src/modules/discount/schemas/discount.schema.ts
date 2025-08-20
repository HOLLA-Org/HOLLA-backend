import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DiscountDocument = Discount & Document;

@Schema({ timestamps: true })
export class Discount {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  value: number;

  @Prop()
  description: string;

  @Prop({ default: 1 })
  max_usage: number;

  @Prop()
  expires_at: Date;

  @Prop({
    type: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        used_count: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  used_by: { user_id: User; used_count: number }[];
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
