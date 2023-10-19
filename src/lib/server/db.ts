import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';

const connectionUrl: string | undefined = process.env.POSTGRES_CONNECTION_URL;
export const queryClient = postgres(connectionUrl!);

export const db: PostgresJsDatabase = drizzle(queryClient);
