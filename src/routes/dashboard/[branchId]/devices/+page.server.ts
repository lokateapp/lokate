import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { eq } from 'drizzle-orm';
import type { SelectBeacon } from '../../../../schema';

export const load: PageServerLoad = async ({ url }) => {
	const branchId = url.pathname.split('/')[2];
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
