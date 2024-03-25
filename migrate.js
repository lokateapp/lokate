import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.POSTGRES_URL, { max: 1 });
const db = drizzle(sql);

console.log('started migrating');
await migrate(db, { migrationsFolder: 'drizzle' });
console.log('finished migrating');

process.exit(0);
