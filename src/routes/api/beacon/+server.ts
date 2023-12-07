import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { RequestHandler } from './$types';
import { beacons } from '../../../schema';

export const POST: RequestHandler = async ({ request }) => {
	const { beaconId } = await request.json();
	const beacon = await db.select().from(beacons).where(eq(beacons.id, beaconId));
	return json(beacon);
};
