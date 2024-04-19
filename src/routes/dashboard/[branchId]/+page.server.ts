import { db } from '$lib/server/db';
import sharp from 'sharp';
import type { PageServerLoad } from './$types';

export const ssr = false;
export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;

	const floorplan = await getFloorPlan(branchId);
	const availableBeacons = await getBeacons(branchId);
	const allCampaigns = await getCampaigns(branchId);

	const floorplanImgPath = floorplan?.imgPath.slice(1);
	const { floorplanImgWidth, floorplanImgHeight } = await getImageDimensions(floorplanImgPath!);

	// console.log('allCampaigns: ', allCampaigns);
	// console.log('availableBeacons: ', availableBeacons);
	return { floorplan, allCampaigns, availableBeacons, floorplanImgWidth, floorplanImgHeight };
};

async function getBeacons(branchId: string) {
	return await db.query.beacons.findMany({
		where: (beacon, { eq }) => eq(beacon.branchId, branchId),
		with: {
			floorplan: true
		}
	});
}

async function getCampaigns(branchId: string) {
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
				},
				orderBy: (beacons, { asc }) => [asc(beacons.campaignId)]
			}
		},
		orderBy: (campaign, { asc }) => [asc(campaign.name)]
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

async function getImageDimensions(imgPath: string) {
	const metadata = await sharp(imgPath).metadata();
	return {
		floorplanImgWidth: metadata.width!,
		floorplanImgHeight: metadata.height!
	};
}
