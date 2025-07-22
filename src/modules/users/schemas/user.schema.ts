import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ROLES } from '@/constant';

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

  @Prop({ default: '' })
  image: string;

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
