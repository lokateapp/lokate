import { getImageDimensions } from '$lib/get-img-dimensions';
import { db } from '$lib/server/db';
import type { PageServerLoad } from '../$types';

export const ssr = false;
export const csr = true;
export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;
	const floorplan = await getFloorPlan(branchId);

	let floorplanImgWidth = 0,
		floorplanImgHeight = 0;
	if (floorplan) {
		const data = getImageDimensions(floorplan.imgPath.slice(1));
		floorplanImgWidth = data.floorplanImgWidth;
		floorplanImgHeight = data.floorplanImgHeight;
	}

	return { branchId, floorplan, floorplanImgWidth, floorplanImgHeight };
};

async function getFloorPlan(branchId: string) {
	return await db.query.floorplans.findFirst({
		where: (floorplan, { eq }) => eq(floorplan.branchId, branchId)
	});
}
