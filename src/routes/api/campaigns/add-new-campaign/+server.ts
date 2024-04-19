import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { RequestHandler } from './$types';
import { beacons, branches, campaigns, campaignsToBeacons } from '$lib/schema';

type NewCampaign = typeof campaigns.$inferSelect;
export const POST: RequestHandler = async ({ request }) => {
	const { name, beaconsId, branchId } = await request.json();
	// console.log(
	// 	'Add new campaign with name: ',
	// 	name,
	// 	' beaconsId: ',
	// 	beaconsId,
	// 	' and branchId: ',
	// 	branchId
	// );
	let branch = await db.query.branches.findFirst({ where: eq(branches.id, branchId) });
	if (!branch) {
		return json({ error: 'Branch not found' }, { status: 500 });
	}

	const newUuid = crypto.randomUUID();
	const campaign: NewCampaign[] = await db
		.insert(campaigns)
		.values({ id: newUuid, name: name, branchId: branch.id })
		.returning();

	// console.log('campaign: ', campaign);

	if (campaign.length === 0) {
		return json({ error: 'Campaign not created' }, { status: 500 });
	}

	for (let i = 0; i < beaconsId.length; i++) {
		let beacon = await db.query.beacons.findFirst({ where: eq(beacons.id, beaconsId[i]) });
		if (!beacon) {
			return json({ error: 'Beacon not found' }, { status: 500 });
		}
		await db
			.insert(campaignsToBeacons)
			.values({ campaignId: campaign[0].id, beaconId: beacon.id })
			.returning();
	}

	let newCampaign = await db.query.campaigns.findFirst({
		where: eq(campaigns.id, campaign[0].id),
		with: { beacons: { with: { beacon: { with: { floorplan: true } } } } }
	});

	// console.log('newCampaign: ', newCampaign);

	return json({ newCampaign });
};
