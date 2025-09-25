/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { config } from 'dotenv';
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as fs from 'fs';
import * as path from 'path';
import z from 'zod';

// Config để đọc file .env
config({
  path: '.env',
  debug: true,
});
// Kiểm tra xem có file env chưa
if (!fs.existsSync(path.resolve('.env'))) {
  console.log("Can't find file .env");
  process.exit(1);
}

// Tạo class ConfigSchema
const configSchema = z.object({
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  SECRET_API_KEY: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_PHONENUMBER: z.string(),
  OTP_EXPIRES_IN: z.string(),
  RESEND_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),
  GOOGLE_CLIENT_REDIRECT_URI: z.string().url()
});
// Convert object process.env trở thành 1 instance của ConfigSchema
const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong file ENV ko hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

const envConfig = configServer.data;
export default envConfig;
