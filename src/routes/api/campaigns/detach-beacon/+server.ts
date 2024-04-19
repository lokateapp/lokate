import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { RequestHandler } from './$types';
import { campaignsToBeacons } from '$lib/schema';

export const POST: RequestHandler = async ({ request }) => {
	const { campaignId, beaconId } = await request.json();
	// console.log('Delete campaignFromBeacon with id: ', campaignId, ' and beaconId: ', beaconId);
	await db
		.delete(campaignsToBeacons)
		.where(
			eq(campaignsToBeacons.campaignId, campaignId) && eq(campaignsToBeacons.beaconId, beaconId)
		);

	// return json({ error: 'error' }, { status: 500 });
	return json('');
};
