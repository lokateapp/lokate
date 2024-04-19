import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { RequestHandler } from './$types';
import { beacons, campaigns, campaignsToBeacons } from '$lib/schema';

export const POST: RequestHandler = async ({ request }) => {
	const { beaconsId, campaignId } = await request.json();
	// console.log('Attach beaconsId: ', beaconsId, ' and campaignId: ', campaignId);

	const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, campaignId) });
	if (!campaign) {
		return json({ error: 'Campaign not found' }, { status: 500 });
	}

	for (let i = 0; i < beaconsId.length; i++) {
		let beacon = await db.query.beacons.findFirst({ where: eq(beacons.id, beaconsId[i]) });
		if (!beacon) {
			return json({ error: 'Beacon not found' }, { status: 500 });
		}
		await db
			.insert(campaignsToBeacons)
			.values({ campaignId: campaign.id, beaconId: beacon.id })
			.returning();
	}

	let updatedCampaign = await db.query.campaigns.findFirst({
		where: eq(campaigns.id, campaign.id),
		with: { beacons: { with: { beacon: { with: { floorplan: true } } } } }
	});

	// console.log('updatedCampaign: ', updatedCampaign);

	return json({ updatedCampaign });
};
