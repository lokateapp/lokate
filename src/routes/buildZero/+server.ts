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
	floorplans
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

	const customer1 = {
		id: crypto.randomUUID(),
		customerId: 'customer1'
	};
	await db.insert(customers).values(customer1);

	const branch1 = {
		id: crypto.randomUUID(),
		userId: userId,
		address: 'Gordion',
		latitude: 39.900099,
		longitude: 32.691764
	};
	await db.insert(branches).values(branch1);

	const branch2 = {
		id: crypto.randomUUID(),
		userId: userId,
		address: 'Bilkent',
		latitude: 39.867891,
		longitude: 32.748718
	};
	await db.insert(branches).values(branch2);

	const floorplan1 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		imgPath: '/src/lib/assets/store_plans/sp3.jpg',
		width: 1000,
		height: 1200
	};
	await db.insert(floorplans).values(floorplan1);

	const floorplan2 = {
		id: crypto.randomUUID(),
		branchId: branch2.id,
		imgPath: '/src/lib/assets/store_plans/sp2.jpg',
		width: 1500,
		height: 1100
	};
	await db.insert(floorplans).values(floorplan2);

	const beacon1 = {
		id: crypto.randomUUID(),
		branchId: branch2.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 2,
		minor: 1,
		radius: 2.0,
		name: 'White'
	};
	await db.insert(beacons).values(beacon1);

	const beacon2 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 1,
		radius: 9.0,
		name: 'Pink'
	};
	await db.insert(beacons).values(beacon2);

	const beacon3 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 2,
		radius: 5.0,
		name: 'Red'
	};
	await db.insert(beacons).values(beacon3);

	const beacon4 = {
		id: crypto.randomUUID(),
		branchId: branch2.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 2,
		minor: 2,
		radius: 5.0,
		name: 'Yellow'
	};
	await db.insert(beacons).values(beacon4);

	/* We need to be careful while associating beacons with floorplans: 
	their branch should match (TODO: there is a trigger controlling such integrity) */
	const beaconsToFloorplansMap = {
		[beacon1.id]: floorplan2,
		[beacon2.id]: floorplan1,
		[beacon3.id]: floorplan1,
		[beacon4.id]: floorplan2
	};

	const campaign1Id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign1Id,
		branchId: branch1.id,
		name: 'Campaign 1',
		status: 'active'
	});

	const campaign2Id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign2Id,
		branchId: branch1.id,
		name: 'Campaign 2',
		status: 'active'
	});

	const campaign3Id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign3Id,
		branchId: branch2.id,
		name: 'Campaign 3',
		status: 'active'
	});

	const branchesToCampaignsMap = {
		[branch1.id]: [campaign1Id, campaign2Id],
		[branch2.id]: [campaign3Id]
	};

	/* We need to be careful while associating campaigns with beacons: 
	their branch should match (there is a trigger controlling such integrity) */
	const campaignsToBeaconsMap = {
		[campaign1Id]: [beacon2.id],
		[campaign2Id]: [beacon3.id],
		[campaign3Id]: [beacon1.id, beacon4.id]
	};

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

	const randomEvents = await generateEvents(
		customer1.id,
		branch1.id,
		branchesToCampaignsMap,
		campaignsToBeaconsMap,
		beaconsToFloorplansMap
	);

	for (const event of randomEvents) {
		await db.insert(events).values(event);
	}

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

async function generateEvents(
	customerId: string,
	branchId: string,
	branchesToCampaignsMap: any,
	campaignsToBeaconsMap: any,
	beaconsToFloorplansMap: any
) {
	const events = [];
	const campaignIds = branchesToCampaignsMap[branchId];

	function getRandomTimestamp(start: Date, end: Date): Date {
		const startTime = start.getTime();
		const endTime = end.getTime();
		const randomTime = startTime + Math.random() * (endTime - startTime);
		return new Date(randomTime);
	}

	// for the past week
	for (let i = 0; i < 7; i++) {
		// beacons will be placed to different locations on each day
		const beaconPositions: { [key: string]: { x: number; y: number } } = {};

		const getImagePromises = [];
		for (const [beaconId, floorplan] of Object.entries(beaconsToFloorplansMap)) {
			const promise = getImageDimensions(floorplan.imgPath.slice(1)) // Remove the first '/' from the path
				.then(({ floorplanImgWidth, floorplanImgHeight }) => {
					const xPos = Math.floor(Math.random() * floorplanImgWidth);
					const yPos = Math.floor(Math.random() * floorplanImgHeight);
					beaconPositions[beaconId] = { x: xPos, y: yPos };
				});
			getImagePromises.push(promise);
		}
		await Promise.all(getImagePromises);

		// generate 100 events for each day
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - i);
		startDate.setHours(8, 0, 0, 0); // Set start time to 8:00 AM
		const endDate = new Date();
		endDate.setDate(endDate.getDate() - i);
		endDate.setHours(22, 0, 0, 0); // Set end time to 10:00 PM
		for (let j = 0; j < 100; j++) {
			const randomCampaignId = campaignIds[Math.floor(Math.random() * campaignIds.length)];
			const beaconIds = campaignsToBeaconsMap[randomCampaignId];
			const randomBeaconId = beaconIds[Math.floor(Math.random() * beaconIds.length)];
			const { x, y } = beaconPositions[randomBeaconId];
			const enterTimestamp = getRandomTimestamp(startDate, endDate); // Random timestamp within the specified range
			const possibleExitTimestamp = new Date(
				enterTimestamp.getTime() + Math.floor(Math.random() * 50000) + 10000
			);

			// 20% of events may remain at STAY status due to possible failure
			const eventStatus = j % 5 === 0 ? 'STAY' : 'EXIT';
			events.push({
				id: crypto.randomUUID(),
				status: eventStatus,
				enterTimestamp,
				possibleExitTimestamp,
				locationX: x,
				locationY: y,
				customerId,
				branchId,
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
		floorplanImgWidth: metadata.width!,
		floorplanImgHeight: metadata.height!
	};
}

// function generateHeatmapMatrix(width: number, height: number) {
// 	const matrix = [];
// 	for (let i = 0; i < height; i++) {
// 		const row = [];
// 		for (let j = 0; j < width; j++) {
// 			row.push(Math.floor(Math.random() * 100)); // Adjust range as needed
// 		}
// 		matrix.push(row);
// 	}
// 	return matrix;
// }
