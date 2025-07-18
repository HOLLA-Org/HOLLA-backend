import { config } from 'dotenv';
config();

export const ROLES = {
  user: process.env.ROLE_USER || 'User',
  admin: process.env.ROLE_ADMIN || 'Admin',
};
