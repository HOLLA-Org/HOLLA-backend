import { config } from 'dotenv';
config();

export const ROLES = {
  user: process.env.ROLE_USER || 'User',
  admin: process.env.ROLE_ADMIN || 'Admin',
};

export enum BookingType {
  PER_HOUR = 'per_hour',
  PER_DAY = 'per_day',
  OVERNIGHT = 'overnight',
}

export enum BookingStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
