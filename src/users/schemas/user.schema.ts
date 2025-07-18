import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  image: string;

  @Prop({ default: 'USER' })
  role: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  codeId: string;
  @Prop()
  codeExpired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
