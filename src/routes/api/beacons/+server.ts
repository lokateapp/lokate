import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';

import type { RequestHandler } from './$types';
import { beacons, beaconsToFloorplans, floorplans } from '../../../schema';

export const POST: RequestHandler = async ({ request }) => {
	const { items } = await request.json();
	items.forEach(async (beacon) => {
		await db
			.update(beacons)
			.set({ radius: beacon.radius, name: beacon.name })
			.where(eq(beacons.id, beacon.id));
		if (beacon.floorplan) {
			await db
				.insert(beaconsToFloorplans)
				.values(beacon.floorplan)
				.onConflictDoUpdate({
					target: [beaconsToFloorplans.beaconId, beaconsToFloorplans.floorplanId],
					set: { x: beacon.floorplan.x, y: beacon.floorplan.y }
				});
			// one beacon can only exist once in beacons_to_floorplans
			// TODO: consider making beaconID primary key in beacons_to_floorplans
		}
	});
	return json('');
};
