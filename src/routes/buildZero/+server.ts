import type { RequestHandler } from './$types';
import { db } from '../../lib/server/db';
import { beacons, campaigns, campaignsToBeacons, user, customers, branch } from '../../schema';
import { auth } from '$lib/server/lucia';
import crypto from 'crypto';
// import {b} from "vitest/dist/types-198fd1d9";

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

	const branch_id = crypto.randomUUID();
	await db.insert(branch).values({
		id: branch_id
	});

	const beacon1 = {
		id: '5d72cc30-5c61-4c09-889f-9ae750fa84ec', // beacon id
		userId: userId, // user id
		radius: 2, // immediate
		major: '1',
		minor: '1',
		name: 'Test Beacon 1',
		branchId: branch_id
	}; // pink
	await db.insert(beacons).values(beacon1);

	await db.insert(customers).values({
		id: '00000000-0000-0000-0000-000000000000',
		customerId: 'customer1'
	});

	const beacon2 = {
		id: 'b9407f30-f5f8-466e-aff9-25556b57fe6d', // red
		userId: userId,
		radius: 9, // far
		major: '1',
		minor: '2',
		name: 'Test Beacon 2',
		branchId: branch_id
	};
	await db.insert(beacons).values(beacon2);

	// D5D885F1-D7DA-4F5A-AD51-487281B7F8B3
	const beacon3 = {
		id: 'd5d885f1-d7da-4f5a-ad51-487281b7f8b3', // sari
		userId: userId,
		radius: 5, // far
		major: '1',
		minor: '3',
		name: 'Test Beacon 3',
		branchId: branch_id
	}; // pink
	await db.insert(beacons).values(beacon3);

	const campaing1_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaing1_id,
		userId: userId,
		name: 'Campaign 1',
		status: 'active'
	});
	const campaing2_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaing2_id,
		userId: userId,
		name: 'Campaign 2',
		status: 'active'
	});

	const campaign3_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign3_id,
		userId: userId,
		name: 'Campaign 3',
		status: 'active'
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaing1_id,
		beaconId: beacon1.id,
		beaconMajor: beacon1.major,
		beaconMinor: beacon1.minor
	});

	// await db.insert(campaignsToBeacons).values({
	// 	campaignId: campaing1_id,
	// 	beaconId: beacon2_id
	// });

	await db.insert(campaignsToBeacons).values({
		campaignId: campaing2_id,
		beaconId: beacon2.id,
		beaconMajor: beacon2.major,
		beaconMinor: beacon2.minor
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaign3_id,
		beaconId: beacon3.id,
		beaconMajor: beacon3.major,
		beaconMinor: beacon3.minor
	});

	// Build the response object with information about the created entities
	const responseObj = {
		createdBeacons: [
			{ id: beacon1.id, name: 'test beacon 1' },
			{ id: beacon2.id, name: 'test beacon 2' }
		],
		createdCampaigns: [
			{ id: campaing1_id, name: 'test campaign1' },
			{ id: campaing2_id, name: 'test campaign2' }
		],
		createdCampaignsToBeacons: [
			{ campaignId: campaing1_id, beaconId: beacon1.id },
			{ campaignId: campaing2_id, beaconId: beacon2.id }
		]
	};

	// Convert the response object to JSON and include it in the response
	const responseBody = JSON.stringify(responseObj);

	return new Response(responseBody, {
		headers: { 'Content-Type': 'application/json' }
	});
};
