import { getImageDimensions } from '$lib/get-img-dimensions';
import { db } from '$lib/server/db';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;
	const floorplan = await getFloorPlan(branchId);
	const floorplanImgPath = floorplan?.imgPath;
	const { floorplanImgWidth, floorplanImgHeight } = await getImageDimensions(floorplanImgPath!);
	const beacons = await getBeacons(branchId);

	return { branchId, floorplan, floorplanImgWidth, floorplanImgHeight, beacons };
};

async function getBeacons(branchId: string) {
	return await db.query.beacons.findMany({
		where: (beacon, { eq }) => eq(beacon.branchId, branchId),
		with: {
			floorplan: true
		},
		orderBy: (beacon, { asc }) => [asc(beacon.name)]
	});
}

async function getFloorPlan(branchId: string) {
	return await db.query.floorplans.findFirst({
		where: (floorplan, { eq }) => eq(floorplan.branchId, branchId)
	});
}
