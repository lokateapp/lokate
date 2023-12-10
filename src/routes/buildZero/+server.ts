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
