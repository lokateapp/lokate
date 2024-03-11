import type { RequestHandler } from '@sveltejs/kit';
import { db } from '../../../../lib/server/db';
import {
	// beaconPositions,
	beacons,
	campaigns,
	campaignsToBeacons,
	type SelectBeacon,
	type SelectCampaignsWithBeacons
} from '../../../../schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ url }) => {
	const branchId = url.pathname.split('/')[2];

	const availableBeacons: SelectBeacon[] = await getBeacons(branchId);
	let allCampaigns: SelectCampaignsWithBeacons[] = await getCampaigns(branchId);

	console.log('allCampaigns: ', allCampaigns);
	console.log('availableBeacons: ', availableBeacons);

	return { allCampaigns: allCampaigns, availableBeacons };
};

async function getBeacons(branchId: string): Promise<SelectBeacon[]> {
	return await db.select().from(beacons).where(eq(beacons.branchId, branchId));
}

async function getCampaigns(branchId: string): Promise<SelectCampaignsWithBeacons[]> {
	return await db.query.campaigns.findMany({
		where: (campaign, { eq }) => eq(campaign.branchId, branchId),
		with: {
			campaignsToBeacons: {
				columns: {},
				with: {
					// beacon: true
					beacon: {
						with: {
							position: true
						}
					}
				}
			}
		}
	});
	// return await db
	// 	.select()
	// 	.from(campaigns)
	// 	.innerJoin(campaignsToBeacons, eq(campaigns.id, campaignsToBeacons.campaignId))
	// 	.innerJoin(beacons, eq(campaignsToBeacons.beaconId, beacons.id))
	// 	.where(eq(campaigns.userId, userId));
}
