import { beacons, campaigns, campaignsToBeacons, user } from './src/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';

const url: string = process.env.POSTGRES_CONNECTION_URL!;
const sql = postgres(url, { max: 1 });
const db = drizzle(sql);

await db.insert(user).values({
	id: 'b3fzlv7vwa7whvz',
	username: 'ahmet123'
});
await db.insert(beacons).values({
	id: '9336dfc2-ad92-41f9-9d9e-b3effd2bd8dc',
	userId: 'b3fzlv7vwa7whvz',
	radius: 0
});
await db.insert(beacons).values({
	id: '550e8400-e29b-41d4-a716-446655440000',
	userId: 'b3fzlv7vwa7whvz',
	radius: 0
});
await db.insert(beacons).values({
	id: 'dd663db3-1bad-4d6f-99a8-2e189c97489e',
	userId: 'b3fzlv7vwa7whvz',
	radius: 0
});

await db.insert(campaigns).values({
	id: '138757a6-81c5-4279-9fbf-0dcbfe079a92',
	userId: 'b3fzlv7vwa7whvz',
	name: 'test campaign'
});
await db.insert(campaignsToBeacons).values({
	campaignId: '138757a6-81c5-4279-9fbf-0dcbfe079a92',
	beaconId: '550e8400-e29b-41d4-a716-446655440000'
});
