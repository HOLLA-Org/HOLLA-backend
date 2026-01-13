import { UserType } from '@/modules/auth/authUser/auth';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: UserType;
}
