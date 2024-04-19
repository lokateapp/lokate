import { db } from '$lib/server/db';
import type { PageServerLoad } from '../$types';
import sharp from 'sharp';

export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;
	const floorplan = await getFloorPlan(branchId);
	const floorplanImgPath = floorplan?.imgPath.slice(1);
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

async function getImageDimensions(imgPath: string) {
	const metadata = await sharp(imgPath).metadata();
	return {
		floorplanImgWidth: metadata.width!,
		floorplanImgHeight: metadata.height!
	};
}
