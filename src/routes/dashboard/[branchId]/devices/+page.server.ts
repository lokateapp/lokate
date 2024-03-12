import { db } from '$lib/server/db';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;
	const beacons = await getBeacons(branchId);

	return { beacons };
};

async function getBeacons(branchId: string) {
	return await db.query.beacons.findMany({
		where: (beacon, { eq }) => eq(beacon.branchId, branchId),
		with: {
			position: true
		}
	});
	// return await db.select().from(beacons).where(eq(beacons.userId, userId));
}
