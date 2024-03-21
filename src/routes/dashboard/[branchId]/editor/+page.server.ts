import { db } from '../../../../lib/server/db';
import type { SelectBeacon, SelectCampaignWithBeacons } from '../../../../schema';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;

	const floorplan = await getFloorPlan(branchId);
	const availableBeacons: SelectBeacon[] = await getBeacons(branchId);
	const allCampaigns: SelectCampaignWithBeacons[] = await getCampaigns(branchId);

	console.log('allCampaigns: ', allCampaigns);
	console.log('availableBeacons: ', availableBeacons);

	return { floorplan, allCampaigns, availableBeacons };
};

async function getBeacons(branchId: string) {
	return await db.query.beacons.findMany({
		where: (beacon, { eq }) => eq(beacon.branchId, branchId),
		with: {
			floorplan: true
		}
	});
}

async function getCampaigns(branchId: string): Promise<SelectCampaignWithBeacons[]> {
	return await db.query.campaigns.findMany({
		where: (campaign, { eq }) => eq(campaign.branchId, branchId),
		with: {
			beacons: {
				columns: {},
				with: {
					beacon: {
						with: {
							floorplan: true
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

async function getFloorPlan(branchId: string) {
	return await db.query.floorplans.findFirst({
		where: (floorplan, { eq }) => eq(floorplan.branchId, branchId)
	});
}
