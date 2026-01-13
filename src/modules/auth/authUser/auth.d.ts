import { User } from '@/modules/users/schemas/user.schema';
import { Document, Types } from 'mongoose';

export type UserType = Document<unknown, object, User> &
  User & { _id: Types.ObjectId };
