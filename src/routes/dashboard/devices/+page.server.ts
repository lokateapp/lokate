import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { eq } from 'drizzle-orm';
import type { SelectBeacon } from '../../../schema';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	const beacons = await getBeacons(session.user.userId);

	return { beacons };
};

async function getBeacons(userId: string){
	return await db.query.beacons.findMany({
		where: (beacon, { eq }) => eq(beacon.userId, userId),
		with: {
			position: true
		}
	});	
	// return await db.select().from(beacons).where(eq(beacons.userId, userId));
}
