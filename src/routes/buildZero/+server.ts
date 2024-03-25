import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { auth } from '$lib/server/lucia';
import crypto from 'crypto';
import sharp from 'sharp';
import {
	beacons,
	campaigns,
	campaignsToBeacons,
	customers,
	branches,
	events,
	floorplans,
	heatmaps
} from '../../schema';

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

	const customer1Id = crypto.randomUUID();
	await db.insert(customers).values({
		id: customer1Id,
		customerId: 'customer1'
	});

	const branch1Id = crypto.randomUUID();
	await db.insert(branches).values({
		id: branch1Id,
		userId: userId,
		address: 'Gordion',
		latitude: 39.900099,
		longitude: 32.691764
	});
	const branch2Id = crypto.randomUUID();
	await db.insert(branches).values({
		id: branch2Id,
		userId: userId,
		address: 'Bilkent',
		latitude: 39.867891,
		longitude: 32.748718
	});

	const floorplan1Id = crypto.randomUUID();
	await db.insert(floorplans).values({
		id: floorplan1Id,
		branchId: branch1Id,
		imgPath: '/src/lib/assets/store_plans/sp2.jpg',
		width: 1000,
		height: 1200
	});

	const floorplan2Id = crypto.randomUUID();
	await db.insert(floorplans).values({
		id: floorplan2Id,
		branchId: branch2Id,
		imgPath: '/src/lib/assets/store_plans/sp3.jpg',
		width: 1500,
		height: 1100
	});

	const beacon1 = {
		id: crypto.randomUUID(),
		branchId: branch2Id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 2,
		minor: 1,
		radius: 2.0,
		name: 'White'
	};
	await db.insert(beacons).values(beacon1);

	const beacon2 = {
		id: crypto.randomUUID(),
		branchId: branch1Id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 1,
		radius: 9.0,
		name: 'Pink'
	};
	await db.insert(beacons).values(beacon2);

	const beacon3 = {
		id: crypto.randomUUID(),
		branchId: branch1Id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 2,
		radius: 5.0,
		name: 'Red'
	};
	await db.insert(beacons).values(beacon3);

	const beacon4 = {
		id: crypto.randomUUID(),
		branchId: branch2Id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 2,
		minor: 2,
		radius: 5.0,
		name: 'Yellow'
	};
	await db.insert(beacons).values(beacon4);

	const campaign1Id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign1Id,
		branchId: branch1Id,
		name: 'Campaign 1',
		status: 'active'
	});
	const campaign2Id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign2Id,
		branchId: branch1Id,
		name: 'Campaign 2',
		status: 'active'
	});

	const campaign3Id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign3Id,
		branchId: branch2Id,
		name: 'Campaign 3',
		status: 'active'
	});

	/* We need to be careful while associating campaigns with beacons: 
	their branch should match (there is a trigger controlling such integrity) */
	const campaignsToBeaconsMap = {
		[campaign1Id]: [beacon2.id],
		[campaign2Id]: [beacon3.id],
		[campaign3Id]: [beacon1.id, beacon4.id]
	};

	console.log(campaignsToBeaconsMap);

	await Promise.all(
		Object.entries(campaignsToBeaconsMap)
			.flatMap(([campaignId, beaconIds]) => {
				return beaconIds.map((beaconId) => {
					return {
						campaignId,
						beaconId
					};
				});
			})
			.map((data) => db.insert(campaignsToBeacons).values(data))
	);

	const randomEvents = generateEvents(customer1Id, campaignsToBeaconsMap);

	for (const event of randomEvents) {
		await db.insert(events).values(event);
	}

	const { width, height } = await getImageDimensions('src/lib/assets/store_plans/sp2.jpg');
	const heatmapMatrix = generateHeatmapMatrix(width, height);

	await db.insert(heatmaps).values({
		id: crypto.randomUUID(),
		floorplanId: floorplan1Id,
		date: new Date().toISOString().slice(0, 10),
		matrix: heatmapMatrix
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
			{ id: campaign1Id, name: 'test campaign1' },
			{ id: campaign2Id, name: 'test campaign2' },
			{ id: campaign3Id, name: 'test campaign3' }
		],
		createdCampaignsToBeacons: [
			{ campaignId: campaign1Id, beaconId: beacon1.id },
			{ campaignId: campaign2Id, beaconId: beacon2.id },
			{ campaignId: campaign3Id, beaconId: beacon3.id }
		]
	};

	// Convert the response object to JSON and include it in the response
	const responseBody = JSON.stringify(responseObj);

	return new Response(responseBody, {
		headers: { 'Content-Type': 'application/json' }
	});
};

function generateEvents(customerId: string, campaignsToBeaconsMap: any) {
	const events = [];
	const campaignIds = Object.keys(campaignsToBeaconsMap);

	function getRandomTimestamp(start: Date, end: Date): Date {
		const startTime = start.getTime();
		const endTime = end.getTime();
		const randomTime = startTime + Math.random() * (endTime - startTime);
		return new Date(randomTime);
	}

	for (let i = 0; i < 100; i++) {
		const randomCampaignId = campaignIds[Math.floor(Math.random() * campaignIds.length)];
		const beaconIds = campaignsToBeaconsMap[randomCampaignId];
		const randomBeaconId = beaconIds[Math.floor(Math.random() * beaconIds.length)];
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
				beaconId: randomBeaconId,
				campaignId: randomCampaignId
			});
		} else {
			events.push({
				id: crypto.randomUUID(),
				status: 'EXIT',
				enterTimestamp,
				possibleExitTimestamp,
				customerId: customerId,
				beaconId: randomBeaconId,
				campaignId: randomCampaignId
			});
		}
	}

	return events;
}

async function getImageDimensions(imgPath: string) {
	const metadata = await sharp(imgPath).metadata();
	return {
		width: metadata.width!,
		height: metadata.height!
	};
}

function generateHeatmapMatrix(width: number, height: number) {
	const matrix = [];
	for (let i = 0; i < height; i++) {
		const row = [];
		for (let j = 0; j < width; j++) {
			row.push(Math.floor(Math.random() * 100)); // Adjust range as needed
		}
		matrix.push(row);
	}
	return matrix;
}
