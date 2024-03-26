import {
	beacons,
	campaigns,
	campaignsToBeacons,
	user,
	customers,
	session,
	key,
	events,
	branches,
	floorplans,
	beaconsToFloorplans
} from '../../../schema';
import { db } from '../../../lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const branchesData = await db.select().from(branches);
		const floorplansData = await db.select().from(floorplans);
		const beaconsToFloorplansData = await db.select().from(beaconsToFloorplans);
		const beaconsData = await db.select().from(beacons);
		const campaignsData = await db.select().from(campaigns);
		const campaignsToBeaconsData = await db.select().from(campaignsToBeacons);
		const userData = await db.select().from(user);
		const customersData = await db.select().from(customers);
		const sessionData = await db.select().from(session);
		const keyData = await db.select().from(key);
		const eventsData = await db.select().from(events);

		const responseObj = {
			branchesData,
			floorplansData,
			beaconsToFloorplansData,
			beaconsData,
			campaignsData,
			campaignsToBeaconsData,
			userData,
			customersData,
			sessionData,
			keyData,
			eventsData
		};

		return new Response(JSON.stringify(responseObj), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response('❌ Error retrieving and combining data: ' + error, { status: 500 });
	}
};
