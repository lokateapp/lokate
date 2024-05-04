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

	const branch3 = {
		id: crypto.randomUUID(),
		userId: userId,
		address: 'Polatli',
		latitude: 39.867891,
		longitude: 32.144638
	};
	await db.insert(branches).values(branch3);

	const floorplan1 = {
		id: crypto.randomUUID(),
		branchId: branch3.id,
		imgPath: '/src/lib/assets/store_plans/sp3.jpg',
		// imgPath:
		// 'https://8nudshqewdlruco8.public.blob.vercel-storage.com/1713950990547_sp3-Ly7E7c2HjN6TEfzehzkeZjJkm5Hj9K.jpg',
		width: 1000,
		height: 1200
	};
	await db.insert(floorplans).values(floorplan1);

	const floorplan2 = {
		id: crypto.randomUUID(),
		branchId: branch2.id,
		imgPath: '/src/lib/assets/store_plans/sp2.jpg',
		// imgPath:
		// 	'https://8nudshqewdlruco8.public.blob.vercel-storage.com/1713952071531_sp2-QRlaPNGuL3TBrQjr0ZLrL1PahDUojg.jpg',
		width: 1500,
		height: 1100
	};
	await db.insert(floorplans).values(floorplan2);

	const floorplan3 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		imgPath: '/src/lib/assets/store_plans/sp4.jpg',
		// imgPath:
		// 'https://8nudshqewdlruco8.public.blob.vercel-storage.com/1713950990547_sp3-Ly7E7c2HjN6TEfzehzkeZjJkm5Hj9K.jpg',
		width: 1000,
		height: 1200
	};
	await db.insert(floorplans).values(floorplan3);

	// floorplan3 is used for clustering
	// it takes time to execute the following line, so comment out if not needed
	// initializeFloorplan3(floorplan3);

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
		branchId: branch3.id,
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
		branchId: branch3.id,
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
		branchId: branch3.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 3,
		radius: 7.0,
		name: 'pseudo1'
	};
	await db.insert(beacons).values(beacon5);

	const beacon6 = {
		id: crypto.randomUUID(),
		branchId: branch3.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 4,
		radius: 3.0,
		name: 'pseudo2'
	};
	await db.insert(beacons).values(beacon6);

	const beacon7 = {
		id: crypto.randomUUID(),
		branchId: branch3.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 5,
		radius: 12.0,
		name: 'pseudo3'
	};
	await db.insert(beacons).values(beacon7);

	const beacon8 = {
		id: crypto.randomUUID(),
		branchId: branch3.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 6,
		radius: 11.0,
		name: 'pseudo4'
	};
	await db.insert(beacons).values(beacon8);

	const beacon9 = {
		id: crypto.randomUUID(),
		branchId: branch3.id,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 7,
		radius: 6.0,
		name: 'pseudo5'
	};
	await db.insert(beacons).values(beacon9);

	const beacon10 = {
		id: crypto.randomUUID(),
		branchId: branch3.id,
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
		branchId: branch3.id,
		name: 'Campaign 1',
		status: 'active'
	});

	const campaign2Id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaign2Id,
		branchId: branch3.id,
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
		[branch3.id]: [campaign1Id, campaign2Id],
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
		branch3.id,
		branchesToCampaignsMap,
		campaignsToBeaconsMap,
		beaconsToFloorplansMap
	);

	for (const event of randomEvents) {
		await db.insert(events).values(event);
	}

	generateProductGroups(branchesToCampaignsMap[branch3.id]);

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
			const { floorplanImgWidth, floorplanImgHeight } = await getImageDimensions(floorplan.imgPath);
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

		// there are two campaigns in branch3, hence length of campaigns array is two
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

async function initializeFloorplan3(floorplan3: any) {
	const beaconLocations = [
		{
			name: 'entry',
			location: [425, 339]
		},
		{
			name: 'b1',
			location: [617, 324]
		},
		{
			name: 'b2',
			location: [693, 322]
		},
		{
			name: 'b3',
			location: [604, 262]
		},
		{
			name: 'b4',
			location: [679, 251]
		},
		{
			name: 'b5',
			location: [648, 116]
		},
		{
			name: 'b6',
			location: [559, 32]
		},
		{
			name: 'b7',
			location: [548, 221]
		},
		{
			name: 'b8',
			location: [501, 179]
		},
		{
			name: 'b9',
			location: [432, 60]
		},
		{
			name: 'b10',
			location: [453, 223]
		},
		{
			name: 'b11',
			location: [405, 177]
		},
		{
			name: 'b12',
			location: [386, 108]
		},
		{
			name: 'b13',
			location: [366, 37]
		},
		{
			name: 'b14',
			location: [357, 224]
		},
		{
			name: 'b15',
			location: [314, 181]
		},
		{
			name: 'b16',
			location: [279, 107]
		},
		{
			name: 'b17',
			location: [269, 200]
		},
		{
			name: 'b18',
			location: [225, 154]
		},
		{
			name: 'b19',
			location: [227, 220]
		},
		{
			name: 'b20',
			location: [200, 255]
		},
		{
			name: 'b21',
			location: [161, 108]
		},
		{
			name: 'b22',
			location: [20, 272]
		},
		{
			name: 'b23',
			location: [72, 297]
		},
		{
			name: 'b24',
			location: [37, 327]
		},
		{
			name: 'exit',
			location: [200, 338]
		}
	];

	const createdBeaconIds = [];
	const createdCampaignIds = [];
	const major = 3;
	const radius = 5.0;
	const branchId: string = floorplan3.branchId;
	for (const [i, beaconLocation] of beaconLocations.entries()) {
		const minor = i + 1;
		const beacon = {
			id: crypto.randomUUID(),
			branchId,
			proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
			major,
			minor,
			radius,
			name: beaconLocation.name
		};
		await db.insert(beacons).values(beacon);
		createdBeaconIds.push(beacon.id);
		await db.insert(beaconsToFloorplans).values({
			beaconId: beacon.id,
			floorplanId: floorplan3.id,
			x: beaconLocation.location[0],
			y: beaconLocation.location[1]
		});
		const campaignId = crypto.randomUUID();
		await db.insert(campaigns).values({
			id: campaignId,
			branchId,
			name: beaconLocation.name,
			status: 'active'
		});
		createdCampaignIds.push(campaignId);
		await db.insert(campaignsToBeacons).values({
			campaignId,
			beaconId: beacon.id
		});
	}

	await generateRoutes(beaconLocations, branchId, createdBeaconIds, createdCampaignIds);
}

async function generateRoutes(
	beaconLocations: any,
	branchId: string,
	createdBeaconIds: string[],
	createdCampaignIds: string[]
) {
	const beaconGraph: number[][] = generateBeaconGraph(beaconLocations);
	const numberOfRoutes = 30_000;
	let customerNo = 0;
	let customerId = '';
	for (let i = 0; i < numberOfRoutes; i++) {
		// there will be 1_000 customers, and each customer will have a route for each day of a month
		if (i % 30 == 0) {
			++customerNo;
			customerId = crypto.randomUUID();
			await db.insert(customers).values({
				id: customerId,
				customerId: `customer${customerNo}`
			});
		}
		const route = generateSingleRoute(beaconGraph);
		await generateRouteEvents(
			beaconLocations,
			route,
			(i % 30) + 1,
			customerId,
			branchId,
			createdBeaconIds,
			createdCampaignIds
		);
		// console.log(route);
	}
}

async function generateRouteEvents(
	beaconLocations: any,
	route: number[],
	day: number,
	customerId: string,
	branchId: string,
	createdBeaconIds: string[],
	createdCampaignIds: string[]
) {
	const enterDay = new Date();
	enterDay.setDate(day);

	for (let [i, beaconIdx] of route.entries()) {
		const {
			_,
			location: [x, y]
		} = beaconLocations[beaconIdx];

		enterDay.setHours(12, i, 0, 0);
		const enterTimestamp = new Date(enterDay.getTime());
		enterDay.setSeconds(30);
		const possibleExitTimestamp = new Date(enterDay.getTime());

		await db.insert(events).values({
			id: crypto.randomUUID(),
			status: EventStatus.EXIT,
			enterTimestamp,
			possibleExitTimestamp,
			locationX: x,
			locationY: y,
			radius: 5.0,
			customerId,
			branchId,
			beaconId: createdBeaconIds[beaconIdx],
			campaignId: createdCampaignIds[beaconIdx]
		});
	}
}

// perform loop-erased random walk
// https://en.wikipedia.org/wiki/Loop-erased_random_walk
function generateSingleRoute(beaconGraph: number[][]) {
	const numberOfBeacons = beaconGraph.length;
	let currentPosition = 0; // enter beacon
	let route = [currentPosition];
	while (currentPosition != numberOfBeacons - 1) {
		let sum = 0;
		let target = Math.random();
		let nextPosition = -1;
		for (let j = 0; j < numberOfBeacons && sum < target; j++) {
			sum += beaconGraph[currentPosition][j];
			++nextPosition;
		}

		// erase loop if exists
		const loopIndex = route.indexOf(nextPosition);
		if (loopIndex != -1) {
			route.splice(loopIndex);
		}

		currentPosition = nextPosition;
		route.push(currentPosition);
	}
	return route;
}

function generateBeaconGraph(beaconLocations: any) {
	// 0th index: entry, 25th index: exit
	const notNormalizedBeaconGraph: number[][] = [
		/* 0*/ [9, 7, 3, 6, 2, 0, 0, 8, 6, 1, 9, 5, 3, 0, 8, 6, 2, 5, 2, 5, 6, 0, 2, 7, 2, 3],
		/* 1*/ [0, 0, 8, 9, 6, 2, 0, 5, 4, 2, 7, 5, 2, 0, 5, 4, 2, 3, 0, 3, 6, 0, 3, 4, 3, 3],
		/* 2*/ [0, 5, 0, 6, 8, 3, 0, 2, 0, 3, 3, 2, 2, 0, 3, 0, 0, 0, 0, 4, 5, 0, 0, 3, 4, 2],
		/* 3*/ [0, 3, 2, 0, 9, 7, 3, 10, 4, 5, 8, 3, 3, 2, 5, 3, 0, 2, 0, 3, 4, 0, 2, 6, 2, 6],
		/* 4*/ [0, 2, 3, 4, 0, 8, 6, 4, 5, 4, 2, 3, 5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
		/* 5*/ [0, 2, 2, 4, 3, 0, 9, 5, 4, 3, 0, 3, 3, 2, 0, 0, 0, 0, 3, 4, 4, 0, 0, 2, 0, 2],
		/* 6*/ [0, 0, 0, 2, 2, 3, 0, 6, 8, 10, 4, 5, 6, 7, 3, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0],
		/* 7*/ [0, 6, 2, 7, 5, 6, 8, 3, 10, 3, 4, 2, 6, 4, 3, 3, 2, 0, 2, 2, 4, 0, 2, 5, 2, 3],
		/* 8*/ [0, 2, 0, 2, 3, 4, 8, 6, 0, 6, 7, 5, 6, 3, 2, 2, 3, 2, 2, 0, 0, 0, 0, 0, 0, 2],
		/* 9*/ [0, 0, 0, 0, 0, 5, 8, 4, 6, 0, 10, 2, 5, 8, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		/*10*/ [0, 7, 3, 5, 2, 0, 6, 6, 8, 2, 0, 7, 5, 0, 5, 2, 2, 2, 3, 3, 5, 2, 0, 4, 2, 4],
		/*11*/ [0, 2, 0, 2, 0, 5, 7, 4, 7, 5, 8, 0, 8, 2, 7, 5, 4, 2, 3, 0, 0, 2, 2, 4, 3, 4],
		/*12*/ [0, 0, 2, 3, 3, 5, 8, 3, 6, 6, 4, 7, 0, 2, 6, 4, 7, 2, 2, 2, 0, 2, 0, 0, 2, 0],
		/*13*/ [0, 0, 0, 0, 2, 4, 5, 3, 5, 10, 2, 2, 3, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		/*14*/ [0, 3, 2, 2, 0, 0, 2, 2, 2, 3, 5, 7, 6, 0, 0, 7, 3, 3, 2, 5, 6, 0, 2, 4, 3, 5],
		/*15*/ [0, 0, 0, 0, 0, 2, 3, 0, 2, 2, 3, 5, 6, 2, 8, 0, 9, 8, 4, 3, 3, 4, 3, 4, 2, 5],
		/*16*/ [0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 3, 4, 6, 2, 3, 8, 0, 7, 8, 3, 2, 7, 2, 3, 0, 2],
		/*17*/ [0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 3, 4, 2, 3, 6, 7, 0, 8, 9, 4, 3, 0, 3, 2, 5],
		/*18*/ [0, 0, 0, 0, 0, 2, 2, 2, 4, 2, 3, 2, 3, 0, 2, 3, 7, 8, 0, 8, 4, 9, 0, 5, 2, 3],
		/*19*/ [0, 2, 0, 0, 0, 0, 2, 0, 2, 3, 2, 3, 2, 0, 6, 5, 5, 8, 8, 0, 10, 6, 2, 4, 5, 7],
		/*20*/ [0, 3, 2, 3, 0, 0, 0, 2, 2, 0, 3, 3, 2, 0, 5, 6, 4, 4, 5, 8, 0, 6, 2, 6, 3, 9],
		/*21*/ [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 4, 5, 3, 7, 6, 8, 0, 0, 5, 2, 6],
		/*22*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 3],
		/*23*/ [0, 3, 2, 4, 2, 0, 0, 0, 0, 0, 3, 2, 2, 0, 4, 3, 2, 4, 2, 3, 8, 6, 7, 0, 24, 7],
		/*24*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 0, 2, 4, 3, 6, 8, 0, 10],
		/*25*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	];

	return normalizeBeaconGraph(notNormalizedBeaconGraph);
}

// make each edge correspond to probability
function normalizeBeaconGraph(beaconGraph: number[][]) {
	for (let i = 0; i < beaconGraph.length; i++) {
		let sum = 0;
		for (let j = 0; j < beaconGraph.length; j++) {
			sum += beaconGraph[i][j];
		}
		if (sum == 0) continue;
		for (let j = 0; j < beaconGraph.length; j++) {
			beaconGraph[i][j] /= sum;
		}
	}
	return beaconGraph;
}

// /* 0*/ [0, 7, 3, 6, 2, 1, 1, 8, 6, 5, 9, 5, 3, 1, 8, 6, 2, 5, 2, 5, 6, 1, 2, 7, 2, 3],
// /* 1*/ [0, 1, 8, 9, 6, 2, 1, 5, 4, 2, 7, 5, 2, 1, 5, 4, 2, 3, 1, 3, 6, 1, 3, 4, 3, 3],
// /* 2*/ [0, 5, 1, 6, 8, 3, 1, 2, 1, 3, 3, 2, 2, 1, 3, 1, 1, 1, 1, 4, 5, 1, 1, 3, 4, 2],
// /* 3*/ [0, 3, 2, 1, 9, 7, 3, 10, 4, 5, 8, 3, 3, 2, 5, 3, 1, 2, 1, 3, 4, 1, 2, 6, 2, 6],
// /* 4*/ [0, 2, 3, 4, 1, 8, 6, 4, 5, 4, 2, 3, 5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
// /* 5*/ [0, 2, 2, 4, 3, 1, 9, 5, 4, 3, 1, 3, 3, 2, 1, 1, 1, 1, 3, 4, 4, 1, 1, 2, 1, 2],
// /* 6*/ [0, 1, 1, 2, 2, 3, 1, 6, 8, 10, 4, 5, 6, 7, 3, 2, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1],
// /* 7*/ [0, 6, 2, 7, 5, 6, 8, 3, 10, 3, 4, 2, 6, 4, 3, 3, 2, 1, 2, 2, 4, 1, 2, 5, 2, 3],
// /* 8*/ [0, 2, 1, 2, 3, 4, 8, 6, 1, 6, 7, 5, 6, 3, 2, 2, 3, 2, 2, 1, 1, 1, 1, 1, 1, 2],
// /* 9*/ [0, 1, 1, 1, 1, 5, 8, 4, 6, 1, 10, 2, 5, 8, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
// /*10*/ [0, 7, 3, 5, 2, 1, 6, 6, 8, 2, 1, 7, 5, 1, 5, 2, 2, 2, 3, 3, 5, 2, 1, 4, 2, 4],
// /*11*/ [0, 2, 1, 2, 1, 5, 7, 4, 7, 5, 8, 1, 8, 2, 7, 5, 4, 2, 3, 1, 1, 2, 2, 4, 3, 4],
// /*12*/ [0, 1, 2, 3, 3, 5, 8, 3, 6, 6, 4, 7, 1, 2, 6, 4, 7, 2, 2, 2, 1, 2, 1, 1, 2, 1],
// /*13*/ [0, 1, 1, 1, 2, 4, 5, 3, 5, 10, 2, 2, 3, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
// /*14*/ [0, 3, 2, 2, 1, 1, 2, 2, 2, 3, 5, 7, 6, 1, 1, 7, 3, 3, 2, 5, 6, 1, 2, 4, 3, 5],
// /*15*/ [0, 1, 1, 1, 1, 2, 3, 1, 2, 2, 3, 5, 6, 2, 8, 1, 9, 8, 4, 3, 3, 4, 3, 4, 2, 5],
// /*16*/ [0, 1, 1, 1, 1, 1, 2, 1, 2, 2, 3, 4, 6, 2, 3, 8, 1, 7, 8, 3, 2, 7, 2, 3, 1, 2],
// /*17*/ [0, 1, 1, 1, 1, 1, 2, 1, 2, 2, 1, 3, 4, 2, 3, 6, 7, 1, 8, 9, 4, 3, 1, 3, 2, 5],
// /*18*/ [0, 1, 1, 1, 1, 2, 2, 2, 4, 2, 3, 2, 3, 1, 2, 3, 7, 8, 1, 8, 4, 9, 1, 5, 2, 3],
// /*19*/ [0, 2, 1, 1, 1, 1, 2, 1, 2, 3, 2, 3, 2, 1, 6, 5, 5, 8, 8, 1, 10, 6, 2, 4, 5, 7],
// /*20*/ [0, 3, 2, 3, 1, 1, 1, 2, 2, 1, 3, 3, 2, 1, 5, 6, 4, 4, 5, 8, 1, 6, 2, 6, 3, 9],
// /*21*/ [0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 2, 1, 1, 4, 5, 3, 7, 6, 8, 1, 1, 5, 2, 6],
// /*22*/ [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 3],
// /*23*/ [0, 3, 2, 4, 2, 1, 1, 1, 1, 1, 3, 2, 2, 1, 4, 3, 2, 4, 2, 3, 8, 6, 7, 1, 24, 7],
// /*24*/ [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 2, 1, 2, 4, 3, 6, 8, 1, 10],
// /*25*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
