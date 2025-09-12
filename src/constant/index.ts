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

export const DEFAULT_AVATAR_URL =
  'https://res.cloudinary.com/dasiiuipv/image/upload/v1755882140/86621cbfa861183f4170_pf3jgf.jpg';
