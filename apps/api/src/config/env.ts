import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  JWT_SECRET: z.string(),
  UPLOAD_DIR: z.string().default('./uploads'),
  ENABLE_DUCKDB: z.string().transform(val => val === 'true').default('false'),
  TZ: z.string().default('Asia/Kuala_Lumpur'),
});

export const env = envSchema.parse(process.env);

// Set timezone
process.env.TZ = env.TZ;
