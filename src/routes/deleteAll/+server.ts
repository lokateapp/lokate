import {
	beacons,
	campaigns,
	campaignsToBeacons,
	customers,
	branches,
	events,
	floorplans,
	beaconsToFloorplans,
	productGroups,
	productGroupsToCampaigns
} from '$lib/schema';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	await db.delete(events);

	await db.delete(beaconsToFloorplans);
	await db.delete(campaignsToBeacons);
	await db.delete(beacons);
	await db.delete(productGroupsToCampaigns);
	await db.delete(productGroups);
	await db.delete(campaigns);
	await db.delete(floorplans);
	await db.delete(branches);
	await db.delete(customers);

	// await db.delete();

	const responseBody = JSON.stringify('All data deleted');

	return new Response(responseBody, {
		headers: { 'Content-Type': 'application/json' }
	});
};
