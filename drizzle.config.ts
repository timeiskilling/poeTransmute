import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

if (!process.env.DB_URL) {
  throw new Error('DB_URL is missing in .env file');
}

export default defineConfig({
  schema: './src/poe2/db/schema.ts',
  out: './src/poe2/db/migrations',
  dialect: 'postgresql',

  dbCredentials: {
    url: process.env.DB_URL,
  },

  verbose: true,
  strict: true,
});
