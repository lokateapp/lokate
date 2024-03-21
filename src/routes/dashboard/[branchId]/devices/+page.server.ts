import { db } from '$lib/server/db';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;
	const floorplan = await getFloorPlan(branchId);
	const beacons = await getBeacons(branchId);

	return { branchId, floorplan, beacons };
};

async function getBeacons(branchId: string) {
	return await db.query.beacons.findMany({
		where: (beacon, { eq }) => eq(beacon.branchId, branchId),
		with: {
			floorplan: true
		}
	});
}

async function getFloorPlan(branchId: string) {
	return await db.query.floorplans.findFirst({
		where: (floorplan, { eq }) => eq(floorplan.branchId, branchId)
	});
}
