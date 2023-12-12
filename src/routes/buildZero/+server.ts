import type { RequestHandler } from './$types';
import { db } from '../../lib/server/db';
import { beacons, campaigns, campaignsToBeacons, user, customers } from '../../schema';
import { auth } from '$lib/server/lucia';
import crypto from 'crypto';

export const GET: RequestHandler = async ({ locals, url }) => {
	let userId = null;
	if (url.searchParams.get('userId') !== null) {
		userId = url.searchParams.get('userId');
	} else if (locals.auth && (await locals.auth.validate())) {
		const session = await locals.auth.validate();
		userId = session.user.userId;
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
		userId = user.userId;
	}

	// console.log('userId: ', userId);

	const beacon1_id = '5d72cc30-5c61-4c09-889f-9ae750fa84ec'; // pink
	await db.insert(beacons).values({
		id: beacon1_id,
		userId: userId,
		radius: 2, // immediate
		major: '1',
		minor: '1',
		name: 'test beacon 1'
	});

	await db.insert(customers).values({
		id: '00000000-0000-0000-0000-000000000000',
		customerId: 'customer1'
	});

	const beacon2_id = 'b9407f30-f5f8-466e-aff9-25556b57fe6d'; // red
	await db.insert(beacons).values({
		id: beacon2_id,
		userId: userId,
		radius: 9, // far
		major: '24719',
		minor: '28241',
		name: 'test beacon 2'
	});

	const campaing1_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaing1_id,
		userId: userId,
		name: 'test campaign1'
	});
	const campaing2_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaing2_id,
		userId: userId,
		name: 'test campaign2'
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaing1_id,
		beaconId: beacon1_id
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaing2_id,
		beaconId: beacon2_id
	});

	// Build the response object with information about the created entities
	const responseObj = {
		createdBeacons: [
			{ id: beacon1_id, name: 'test beacon 1' },
			{ id: beacon2_id, name: 'test beacon 2' }
		],
		createdCampaigns: [
			{ id: campaing1_id, name: 'test campaign1' },
			{ id: campaing2_id, name: 'test campaign2' }
		],
		createdCampaignsToBeacons: [
			{ campaignId: campaing1_id, beaconId: beacon1_id },
			{ campaignId: campaing2_id, beaconId: beacon2_id }
		]
	};

	// Convert the response object to JSON and include it in the response
	const responseBody = JSON.stringify(responseObj);

	return new Response(responseBody, {
		headers: { 'Content-Type': 'application/json' }
	});
};
