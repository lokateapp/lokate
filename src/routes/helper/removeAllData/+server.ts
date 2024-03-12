import {
	beacons,
	campaigns,
	campaignsToBeacons,
	user,
	customers,
	session,
	key,
	events,
	branches,
	beaconPositions
} from '../../../schema';
import { db } from '../../../lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({}) => {
	try {
		await db.delete(events);
		await db.delete(customers);
		await db.delete(campaigns);
		await db.delete(campaignsToBeacons);
		await db.delete(beacons);
		await db.delete(beaconPositions);
		await db.delete(branches);
		await db.delete(key);
		await db.delete(session);
		await db.delete(user);

		// Use Response constructor with a null body and status code 200
		return new Response('✅ Database emptied', { status: 200 });
	} catch (error) {
		// Use Response constructor with a null body and status code 500
		return new Response('❌ Error emptying the database: ' + error, { status: 500 });
	}
};
