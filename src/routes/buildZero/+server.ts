import type { RequestHandler } from '../$types';
import { db } from '../../lib/server/db';
import { eq } from 'drizzle-orm';
import { beacons, campaigns, campaignsToBeacons, user } from '../../schema';

export const GET: RequestHandler = async () => {
	// create default objects for campaigns beacons user and campaigns to beacons
	// use this for default uidd "userId": "b3fzlv7vwa7whvz", "beaconUID": "550e8400-e29b-41d4-a716-446655440000", campaignId: "138757a6-81c5-4279-9fbf-0dcbfe079a92"
	// first create this objects
	// then add them to db using db.insert
	// then return a response
	// Your logic for buildZero
	await db.insert(user).values({
		id: 'b3fzlv7vwa7whvz',
		username: 'ahmet123'
	});

	await db.insert(beacons).values({
		id: '550e8400-e29b-41d4-a716-446655440000',
		userId: 'b3fzlv7vwa7whvz',
		radius: 0
	});

	await db.insert(beacons).values({
		id: 'b270a94d-d16d-4f3d-ac6f-3ce8f66b7cde',
		userId: 'b3fzlv7vwa7whvz',
		radius: 0
	});

	await db.insert(campaigns).values({
		id: '138757a6-81c5-4279-9fbf-0dcbfe079a92',
		userId: 'b3fzlv7vwa7whvz',
		name: 'test campaign'
	});

	await db.insert(campaigns).values({
		id: '7abb172d-bbe7-4588-9131-9d1b0f1d3cb5',
		userId: 'b3fzlv7vwa7whvz',
		name: 'test campaign'
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: '7abb172d-bbe7-4588-9131-9d1b0f1d3cb5',
		beaconId: '550e8400-e29b-41d4-a716-446655440000'
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: '138757a6-81c5-4279-9fbf-0dcbfe079a92',
		beaconId: 'b270a94d-d16d-4f3d-ac6f-3ce8f66b7cde'
	});


	return new Response('Build successful');
};
