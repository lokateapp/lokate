import type { RequestHandler } from './$types';
import { db } from '../../lib/server/db';
import { beacons, campaigns, campaignsToBeacons, user } from '../../schema';
import { auth } from '$lib/server/lucia';

export const GET: RequestHandler = async () => {
	// create default objects for campaigns beacons user and campaigns to beacons
	// use this for default uidd "userId": "b3fzlv7vwa7whvz", "beaconUID": "550e8400-e29b-41d4-a716-446655440000", campaignId: "138757a6-81c5-4279-9fbf-0dcbfe079a92"
	// first create this objects
	// then add them to db using db.insert
	// then return a response
	// Your logic for buildZero
	const user = await auth.createUser({
		key: {
			providerId: 'username', // auth method
			providerUserId: 'asd'.toLowerCase(), // unique id when using "username" auth method
			password: 'qwe' // hashed by Lucia
		},
		attributes: {
			username: 'asd'
		}
	});
	console.log({ user });

	await db.insert(beacons).values({
		id: '152edb85-4bc6-40a0-a537-9b81967e3eb7',
		userId: user.userId,
		radius: 0
	});
	await db.insert(campaigns).values({
		id: 'a34c784f-7c44-473e-9810-d521d36d7541',
		userId: user.userId,
		name: 'test campaign'
	});
	await db.insert(campaignsToBeacons).values({
		campaignId: 'a34c784f-7c44-473e-9810-d521d36d7541',
		beaconId: '152edb85-4bc6-40a0-a537-9b81967e3eb7'
	});

	return new Response('Build successful');
};
