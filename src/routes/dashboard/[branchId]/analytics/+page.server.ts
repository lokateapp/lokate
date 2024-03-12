import type { RequestHandler } from '@sveltejs/kit';
import { db } from '../../../../lib/server/db';
import {
	events,
	beacons,
	campaigns,
	branches,
	type SelectEvents,
	campaignsToBeacons
} from '../../../../schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';

// TODO: make below for the entire application
export const ssr = false;
export const csr = true;

export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;
	const events = await getEvents(branchId);

	const concatenatedEvents = events.map((event) => {
		return {
			...event['beacons'],
			...event['campaigns'],
			...event['events']
			// ...event["customers"],
		};
	});

	console.log('concatenatedEvents: ', concatenatedEvents);

	// concatenatedEvents.push({
	//     id: '00000000-0000-0000-0000-000000000000',
	//     name: 'test campaign1',
	//     status: 'ENTER',
	//     timestamp: '2021-08-01T00:00:00.000Z',
	//     customerId: '00000000-0000-0000-0000-000000000000',
	//     campaignId: '00000000-0000-0000-0000-000000000000',
	// });

	return { events: concatenatedEvents };
};

async function getEvents(branchId: string): Promise<SelectEvents[]> {
	return await db
		.select()
		.from(events)
		.innerJoin(beacons, eq(events.beaconId, beacons.id))
		.innerJoin(campaignsToBeacons, eq(beacons.id, campaignsToBeacons.beaconId))
		.innerJoin(campaigns, eq(campaignsToBeacons.campaignId, campaigns.id))
		// .innerJoin(customers, eq(events.customerId, customers.id))
		.where(eq(campaigns.branchId, branchId));
}
