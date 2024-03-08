import type { Config } from 'drizzle-kit';
import 'dotenv/config';

const connectionUrl = process.env.POSTGRES_URL || "localhost";
if (!connectionUrl) {
    throw new Error('POSTGRES_URL environment variable is not defined.');
}

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  driver: 'pg', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    host    : process.env.POSTGRES_HOST || 'localhost',
    database: connectionUrl,
  },
} satisfies Config;