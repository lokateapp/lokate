import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { RequestHandler } from './$types';
import { beacons, beaconsToFloorplans } from '$lib/schema';

export const POST: RequestHandler = async ({ request }) => {
	const { beaconId, name, radius, floorplan } = await request.json();

	let beacon = await db.query.beacons.findFirst({
		where: (beacon) => eq(beacon.id, beaconId),
		with: {
			floorplan: true
		}
	});

	if (!beacon) {
		return json({ error: 'Beacon not found' }, { status: 404 });
	}

	await db.update(beacons).set({ radius: radius, name: name }).where(eq(beacons.id, beaconId));
	if (beacon.floorplan) {
		await db
			.update(beaconsToFloorplans)
			.set({ x: floorplan.x, y: floorplan.y })
			.where(eq(beaconsToFloorplans.beaconId, beaconId));
	} else {
		await db
			.insert(beaconsToFloorplans)
			.values(floorplan)
			.onConflictDoUpdate({
				target: [beaconsToFloorplans.beaconId, beaconsToFloorplans.floorplanId],
				set: { x: floorplan.x, y: floorplan.y }
			});
	}
	return json('');
};

// export const POST: RequestHandler = async ({ request }) => {
// 	const { items } = await request.json();
// 	items.forEach(async (beacon) => {
// 		await db
// 			.update(beacons)
// 			.set({ radius: beacon.radius, name: beacon.name })
// 			.where(eq(beacons.id, beacon.id));
// 		if (beacon.floorplan) {
// 			await db
// 				.insert(beaconsToFloorplans)
// 				.values(beacon.floorplan)
// 				.onConflictDoUpdate({
// 					target: [beaconsToFloorplans.beaconId, beaconsToFloorplans.floorplanId],
// 					set: { x: beacon.floorplan.x, y: beacon.floorplan.y }
// 				});
// 			// one beacon can only exist once in beacons_to_floorplans
// 			// TODO: consider making beaconID primary key in beacons_to_floorplans
// 		}
// 	});
// 	return json('');
// };
