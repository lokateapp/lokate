import type { RequestHandler } from './$types';
import { db } from '../../lib/server/db';
import { beacons, campaigns, campaignsToBeacons, customers, branches } from '../../schema';
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

	await db.insert(customers).values({
		id: '00000000-0000-0000-0000-000000000000',
		customerId: 'customer1'
	});

	const branch1_id = crypto.randomUUID();
	await db.insert(branches).values({
		id: branch1_id,
		address: 'Gordion',
		latitude: 39.900099,
		longitude: 32.691764
	});
	const branch2_id = crypto.randomUUID();
	await db.insert(branches).values({
		id: branch2_id,
		address: 'Bilkent',
		latitude: 39.867891,
		longitude: 32.748718
	});

	const beacon1 = {
		id: crypto.randomUUID(),
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 2,
		minor: 1,
		userId: userId,
		branchId: branch2_id,
		radius: 2.0,
		name: 'White'
	};
	await db.insert(beacons).values(beacon1);

	const beacon2 = {
		id: crypto.randomUUID(),
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 1,
		userId: userId,
		branchId: branch1_id,
		radius: 9.0,
		name: 'Pink'
	};
	await db.insert(beacons).values(beacon2);

	const beacon3 = {
		id: crypto.randomUUID(),
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 2,
		userId: userId,
		branchId: branch1_id,
		radius: 5.0,
		name: 'Red'
	};
	await db.insert(beacons).values(beacon3);

	const beacon4 = {
		id: crypto.randomUUID(),
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 2,
		minor: 2,
		userId: userId,
		branchId: branch2_id,
		radius: 5.0,
		name: 'Yellow'
	};
	await db.insert(beacons).values(beacon4);

	const campaign1_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign1_id,
		userId: userId,
		name: 'Campaign 1',
		status: 'active'
	});
	const campaign2_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign2_id,
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
		campaignId: campaign1_id,
		beaconId: beacon1.id
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaign2_id,
		beaconId: beacon2.id
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaign3_id,
		beaconId: beacon3.id
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaign3_id,
		beaconId: beacon4.id
	});

	// Build the response object with information about the created entities
	const responseObj = {
		createdBeacons: [
			{ id: beacon1.id, name: beacon1.name },
			{ id: beacon2.id, name: beacon2.name },
			{ id: beacon3.id, name: beacon3.name },
			{ id: beacon4.id, name: beacon4.name }
		],
		createdCampaigns: [
			{ id: campaign1_id, name: 'test campaign1' },
			{ id: campaign2_id, name: 'test campaign2' },
			{ id: campaign3_id, name: 'test campaign3' }
		],
		createdCampaignsToBeacons: [
			{ campaignId: campaign1_id, beaconId: beacon1.id },
			{ campaignId: campaign2_id, beaconId: beacon2.id },
			{ campaignId: campaign3_id, beaconId: beacon3.id }
		]
	};

	// Convert the response object to JSON and include it in the response
	const responseBody = JSON.stringify(responseObj);

	return new Response(responseBody, {
		headers: { 'Content-Type': 'application/json' }
	});
};
