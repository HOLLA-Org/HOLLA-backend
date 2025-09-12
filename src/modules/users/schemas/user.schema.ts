import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DEFAULT_AVATAR_URL, ROLES } from '@/constant';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
@Schema({ timestamps: true })
export class User {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  address: string;

  @Prop({
    type: String,
    required: false,
    default: DEFAULT_AVATAR_URL,
  })
  avatarUrl: string;

  @Prop({ type: String, required: false, select: false })
  avatarPublicId: string;

  @Prop({ enum: ['male', 'female', 'other', ''], default: '' })
  gender: string;

  @Prop({ default: null })
  date_of_birth: Date;

  @Prop({ type: String, enum: ROLES, default: ROLES.user })
  role: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  codeId: string;
  @Prop()
  codeExpired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
