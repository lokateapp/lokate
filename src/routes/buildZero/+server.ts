import type { RequestHandler } from './$types';
import { db } from '../../lib/server/db';
import {
	beacons,
	campaigns,
	campaignsToBeacons,
	customers,
	branches,
	events,
	floorplans
} from '../../schema';
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

	const customer1_id = crypto.randomUUID();
	await db.insert(customers).values({
		id: customer1_id,
		customerId: 'customer1'
	});

	const branch1_id = crypto.randomUUID();
	await db.insert(branches).values({
		id: branch1_id,
		userId: userId,
		address: 'Gordion',
		latitude: 39.900099,
		longitude: 32.691764
	});
	const branch2_id = crypto.randomUUID();
	await db.insert(branches).values({
		id: branch2_id,
		userId: userId,
		address: 'Bilkent',
		latitude: 39.867891,
		longitude: 32.748718
	});

	const floorplan1_id = crypto.randomUUID();
	await db.insert(floorplans).values({
		id: floorplan1_id,
		branchId: branch1_id,
		imgPath: '/src/lib/assets/store_plans/2.jpg',
		width: 1000,
		height: 1200
	});

	const floorplan2_id = crypto.randomUUID();
	await db.insert(floorplans).values({
		id: floorplan2_id,
		branchId: branch2_id,
		imgPath: '/src/lib/assets/store_plans/3.jpg',
		width: 1500,
		height: 1100
	});

	const beacon1 = {
		id: crypto.randomUUID(),
		branchId: branch2_id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 2,
		minor: 1,
		radius: 2.0,
		name: 'White'
	};
	await db.insert(beacons).values(beacon1);

	const beacon2 = {
		id: crypto.randomUUID(),
		branchId: branch1_id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 1,
		radius: 9.0,
		name: 'Pink'
	};
	await db.insert(beacons).values(beacon2);

	const beacon3 = {
		id: crypto.randomUUID(),
		branchId: branch1_id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 2,
		radius: 5.0,
		name: 'Red'
	};
	await db.insert(beacons).values(beacon3);

	const beacon4 = {
		id: crypto.randomUUID(),
		branchId: branch2_id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 2,
		minor: 2,
		radius: 5.0,
		name: 'Yellow'
	};
	await db.insert(beacons).values(beacon4);

	const campaign1_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign1_id,
		branchId: branch1_id,
		name: 'Campaign 1',
		status: 'active'
	});
	const campaign2_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign2_id,
		branchId: branch1_id,
		name: 'Campaign 2',
		status: 'active'
	});

	const campaign3_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign3_id,
		branchId: branch2_id,
		name: 'Campaign 3',
		status: 'active'
	});

	/* We need to be careful while associating campaigns with branches: 
	their branch should match (there is a trigger controlling such integrity) */
	await db.insert(campaignsToBeacons).values({
		campaignId: campaign3_id,
		beaconId: beacon1.id
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaign1_id,
		beaconId: beacon2.id
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaign2_id,
		beaconId: beacon3.id
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaign3_id,
		beaconId: beacon4.id
	});

	await generateEvents(events, customer1_id, [beacon1.id, beacon2.id, beacon3.id, beacon4.id]);

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

async function generateEvents(eventsTable, customerId, beaconIDs) {
	const events = [];

	function getRandomTimestamp(start: Date, end: Date): Date {
		const startTime = start.getTime();
		const endTime = end.getTime();
		const randomTime = startTime + Math.random() * (endTime - startTime);
		return new Date(randomTime);
	}

	for (let i = 0; i < 100; i++) {
		const beaconId = beaconIDs[Math.floor(Math.random() * beaconIDs.length)]; // Randomly select a beacon ID
		const enterTimestamp = getRandomTimestamp(new Date('2024-03-11T08:00:00Z'), new Date()); // Random timestamp within the specified range
		const possibleExitTimestamp = new Date(
			enterTimestamp.getTime() + Math.floor(Math.random() * 50000) + 10000
		);

		// 20% percent of events may remain at STAY status due to possible failure
		if (i % 5 == 0) {
			events.push({
				id: crypto.randomUUID(),
				status: 'STAY',
				enterTimestamp,
				possibleExitTimestamp,
				customerId: customerId,
				beaconId
			});
		} else {
			events.push({
				id: crypto.randomUUID(),
				status: 'EXIT',
				enterTimestamp,
				possibleExitTimestamp,
				customerId: customerId,
				beaconId
			});
		}
	}

	for (const event of events) {
		await db.insert(eventsTable).values(event);
	}
}
