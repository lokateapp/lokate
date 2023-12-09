import type { RequestHandler } from './$types';
import { db } from '../../lib/server/db';
import { beacons, campaigns, campaignsToBeacons, user } from '../../schema';
import { auth } from '$lib/server/lucia';
import crypto from 'crypto';

export const GET: RequestHandler = async ({ url }) => {
	let userId;
	if (url.searchParams.get('userId')) {
		userId = Number(url.searchParams.get('userId'));
	} else {
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
		userId = user.id;
	}

	await db.insert(beacons).values({
		id: crypto.randomUUID(),
		userId: userId,
		radius: 0,
		major: '100',
		minor: '12',
		name: 'test beacon 1'
	});

	// await db.insert(campaigns).values({
	// 	id: 'a34c784f-7c44-473e-9810-d521d36d7541',
	// 	userId: userId,
	// 	name: 'test campaign'
	// });

	// await db.insert(campaignsToBeacons).values({
	// 	campaignId: 'a34c784f-7c44-473e-9810-d521d36d7541',
	// 	beaconId: '152edb85-4bc6-40a0-a537-9b81967e3eb7'
	// });

	return new Response('Build successful');
};
