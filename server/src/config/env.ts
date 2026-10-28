import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'arquoncx-dev-secret-key-2026',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
