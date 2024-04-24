import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { auth } from '$lib/server/lucia';
import crypto from 'crypto';
import {
	beacons,
	campaigns,
	campaignsToBeacons,
	customers,
	branches,
	events,
	floorplans,
	beaconsToFloorplans,
	productGroups,
	EventStatus,
	productGroupsToCampaigns
} from '$lib/schema';
import { getImageDimensions } from '$lib/get-img-dimensions';

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
		customerId: 'umut'
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

	// place pink beacon to the floorplan
	await db.insert(beaconsToFloorplans).values({
		beaconId: beacon2.id,
		floorplanId: floorplan1.id,
		x: 100,
		y: 100
	});

	const beacon3 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 2,
		radius: 0.5,
		name: 'Red'
	};
	await db.insert(beacons).values(beacon3);

	// place red beacon to the floorplan
	await db.insert(beaconsToFloorplans).values({
		beaconId: beacon3.id,
		floorplanId: floorplan1.id,
		x: 400,
		y: 400
	});

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

	const beacon5 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 3,
		radius: 7.0,
		name: 'pseudo1'
	};
	await db.insert(beacons).values(beacon5);

	const beacon6 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 4,
		radius: 3.0,
		name: 'pseudo2'
	};
	await db.insert(beacons).values(beacon6);

	const beacon7 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 5,
		radius: 12.0,
		name: 'pseudo3'
	};
	await db.insert(beacons).values(beacon7);

	const beacon8 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 6,
		radius: 11.0,
		name: 'pseudo4'
	};
	await db.insert(beacons).values(beacon8);

	const beacon9 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 7,
		radius: 6.0,
		name: 'pseudo5'
	};
	await db.insert(beacons).values(beacon9);

	const beacon10 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 8,
		radius: 15.0,
		name: 'pseudo6'
	};
	await db.insert(beacons).values(beacon10);

	/* We need to be careful while associating beacons with floorplans: 
	their branch should match (there is a trigger controlling such integrity) */
	const beaconsToFloorplansMap = {
		[beacon1.id]: floorplan2,
		[beacon2.id]: floorplan1,
		[beacon3.id]: floorplan1,
		[beacon4.id]: floorplan2,
		[beacon5.id]: floorplan1,
		[beacon6.id]: floorplan1,
		[beacon7.id]: floorplan1,
		[beacon8.id]: floorplan1,
		[beacon9.id]: floorplan1,
		[beacon10.id]: floorplan1
	};

	const insertBeaconsToFloorplansPromises = [];
	for (const [beaconId, floorplan] of Object.entries(beaconsToFloorplansMap)) {
		if (beaconId == beacon2.id || beaconId == beacon3.id) {
			continue; // red and pink beacons are already placed
		}
		// initial positions of beacons is (0,0)
		const data = { beaconId, floorplanId: floorplan.id, x: 0, y: 0 };
		insertBeaconsToFloorplansPromises.push(db.insert(beaconsToFloorplans).values(data));
	}
	await Promise.all(insertBeaconsToFloorplansPromises);

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
		[campaign1Id]: [beacon2.id, beacon5.id, beacon6.id, beacon9.id],
		[campaign2Id]: [beacon3.id, beacon7.id, beacon8.id, beacon10.id],
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

	generateProductGroups(branchesToCampaignsMap[branch1.id]);

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
		// beacons will be placed to different locations with different radiuses on each day,
		// which means events will occur on different locations, but notice that this has nothing
		// to do with beacon placement on the floorplan, i.e. no update to beacons_to_floorplans table
		// it is just for populating heatmaps with some pseudo events happening on different locations
		const beaconPositions: { [key: string]: { x: number; y: number; r: number } } = {};

		for (const [beaconId, floorplan] of Object.entries(beaconsToFloorplansMap) as any) {
			const { floorplanImgWidth, floorplanImgHeight } = getImageDimensions(
				floorplan.imgPath.slice(1)
			);
			const xPos = Math.floor(Math.random() * floorplanImgWidth);
			const yPos = Math.floor(Math.random() * floorplanImgHeight);
			const radius = Math.random() * 15;
			beaconPositions[beaconId] = { x: xPos, y: yPos, r: radius };
		}
		// generate 100 events for each day
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - i);
		startDate.setHours(8, 0, 0, 0); // Set start time to 8:00 AM
		const endDate = new Date();
		endDate.setDate(endDate.getDate() - i);
		endDate.setHours(22, 0, 0, 0); // Set end time to 10:00 PM
		// generate less events for today (for demonstration purposes, in this way heatmap is updated quickly)
		for (let j = i === 0 ? 90 : 0; j < 100; j++) {
			const randomCampaignId = campaignIds[Math.floor(Math.random() * campaignIds.length)];
			const beaconIds = campaignsToBeaconsMap[randomCampaignId];
			const randomBeaconId = beaconIds[Math.floor(Math.random() * beaconIds.length)];
			const { x, y, r } = beaconPositions[randomBeaconId];
			const enterTimestamp = getRandomTimestamp(startDate, endDate); // Random timestamp within the specified range
			const possibleExitTimestamp = new Date(
				enterTimestamp.getTime() + Math.floor(Math.random() * 50000) + 10000
			);

			// 20% of events may remain at STAY status due to possible failure
			const eventStatus = j % 5 === 0 ? EventStatus.STAY : EventStatus.EXIT;
			events.push({
				id: crypto.randomUUID(),
				status: eventStatus,
				enterTimestamp,
				possibleExitTimestamp,
				locationX: x,
				locationY: y,
				radius: r,
				customerId,
				branchId,
				beaconId: randomBeaconId,
				campaignId: randomCampaignId
			});
		}
	}

	return events;
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

async function generateProductGroups(campaigns: any) {
	const category_keys = [
		'seker_sakiz',
		'cikolata_biskuvi',
		'cips',
		'gevrek',
		'bebek',
		'sampuan_dusjeli',
		'sabun',
		'kisisel_bakim',
		'camasir',
		'bulasik',
		'ev_temizligi',
		'makarna_pirinc_bakliyat',
		'hazirgida_baharat',
		'sigara',
		'pasta',
		'peynir_tereyagi',
		'dondurulmus',
		'yumurta',
		'salam_sosis_sucuk',
		'kahve',
		'cay',
		'alet',
		'sos',
		'ekmek',
		'sivi_yag',
		'meyve_sebze',
		'maden_suyu',
		'icecek',
		'kolonya',
		'konserve_salca',
		'pecete',
		'mangal',
		'poset',
		'recel_bal',
		'porselen',
		'dondurma',
		'kedi_kopek',
		'kuruyemis',
		'plastik',
		'su',
		'sut',
		'ayran_yogurt',
		'pil'
	];

	for (let i = 0; i < category_keys.length; i++) {
		const category = {
			id: crypto.randomUUID(),
			groupName: category_keys[i]
		};
		await db.insert(productGroups).values(category);

		// there are two campaigns in branch1, hence length of campaigns array is two
		// first half of the products is mapped to the first campaign
		// second half of the products is mapped to the second campaign
		// the same mapping is performed in the demo mobile application
		const match = {
			campaignId: i < category_keys.length / 2 ? campaigns[0] : campaigns[1],
			productGroupId: category.id
		};
		await db.insert(productGroupsToCampaigns).values(match);
	}
}
