import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema()
export class RefreshToken {
  @Prop({ required: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: false })
  revoked: boolean;

  @Prop({ type: [String], default: [] })
  refreshTokenUsed: string[];
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Add index for efficient querying
RefreshTokenSchema.index({ token: 1, user: 1 });
