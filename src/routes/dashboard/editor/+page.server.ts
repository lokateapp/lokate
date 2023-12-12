import type { RequestHandler } from '@sveltejs/kit';
import { db } from '../../../lib/server/db';
import {
	beacons,
	campaigns,
	campaignsToBeacons,
	type SelectBeacon,
	type SelectCampaignsWIthBeacons
} from '../../../schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	const availableBeacons: SelectBeacon[] = await getBeacons(session.user.userId);

	const allCampaigns: SelectCampaignsWIthBeacons[] = await getCampaigns(session.user.userId);

	console.log('allCampaigns: ', allCampaigns);
	console.log('availableBeacons: ', availableBeacons);

	return { allCampaigns, availableBeacons };
};

async function getBeacons(userId: string): Promise<SelectBeacon[]> {
	return await db.select().from(beacons).where(eq(beacons.userId, userId));
}

async function getCampaigns(userId: string): Promise<SelectCampaignsWIthBeacons[]> {
	return await db
		.select()
		.from(campaigns)
		.innerJoin(campaignsToBeacons, eq(campaigns.id, campaignsToBeacons.campaignId))
		.innerJoin(beacons, eq(campaignsToBeacons.beaconId, beacons.id))
		.where(eq(campaigns.userId, userId));
}
