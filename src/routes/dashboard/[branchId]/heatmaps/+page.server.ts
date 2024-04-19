import { db } from '$lib/server/db';
import type { PageServerLoad } from '../$types';

export const ssr = false;
export const csr = true;
export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;
	const floorplan = await getFloorPlan(branchId);

	return { branchId, floorplan };
};

async function getFloorPlan(branchId: string) {
	return await db.query.floorplans.findFirst({
		where: (floorplan, { eq }) => eq(floorplan.branchId, branchId)
	});
}
