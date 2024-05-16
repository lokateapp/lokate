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
	// let userId = null;
	// if (url.searchParams.get('userId') !== null) {
	// 	userId = url.searchParams.get('userId');
	// } else if (locals.auth && (await locals.auth.validate())) {
	// 	const session = await locals.auth.validate();
	// 	userId = session.user.userId;
	// } else {
	// 	const user = await auth.createUser({
	// 		key: {
	// 			providerId: 'username', // auth method
	// 			providerUserId: 'asd'.toLowerCase(), // unique id when using "username" auth method
	// 			password: 'qwe' // hashed by Lucia
	// 		},
	// 		attributes: {
	// 			username: 'asd'
	// 		}
	// 	});
	// 	userId = user.userId;
	// }

	const customer = {
		id: crypto.randomUUID(),
		customerId: 'umut'
	};

	await db.insert(customers).values(customer);

	const demo = url.searchParams.get('demo');

	if (demo === 'market') {
		await prepareMarketDemo(customer.id);
	} else if (demo === 'museum') {
		await prepareMuseumDemo();
	} else if (demo === 'gym') {
		await prepareGymDemo();
	} else if (demo === 'fair') {
		await prepareFairDemo();
	} else {
		await prepareMarketDemo(customer.id);
		await prepareFairDemo();
	}

	const responseBody = JSON.stringify('Success!');

	return new Response(responseBody, {
		headers: { 'Content-Type': 'application/json' }
	});
};

// DEMO 1 (Shopping):

async function prepareMarketDemo(customerId: string) {
	const user = await auth.createUser({
		key: {
			providerId: 'username', // auth method
			providerUserId: 'market'.toLowerCase(), // unique id when using "username" auth method
			password: 'market' // hashed by Lucia
		},
		attributes: {
			username: 'market'
		}
	});
	const userId: string = user.userId;

	const branch1 = {
		id: crypto.randomUUID(),
		userId,
		address: 'Bilkent',
		latitude: 39.867891,
		longitude: 32.748718
	};
	await db.insert(branches).values(branch1);

	const floorplan1 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		imgPath: '/src/lib/assets/store_plans/market.jpg',
		width: 1000,
		height: 1200
	};
	await db.insert(floorplans).values(floorplan1);

	const lokateBeaconIndexes = [0, 3, 6, 13];
	let lokateBeacons = await initializeLokateBeacons(branch1.id);
	let pseudoBeacons = await initializePseudoBeacons(branch1.id, 1, 8, 22);

	let beacons1 = new Array(26).fill(null);

	// Fill lokateBeacons at their respective indexes
	for (let [i, idx] of lokateBeaconIndexes.entries()) {
		beacons1[idx] = lokateBeacons[i];
	}
	// Fill the rest with pseudoBeacons
	for (let i = 0; i < beacons1.length; i++) {
		if (beacons1[i] === null) {
			beacons1[i] = pseudoBeacons.shift();
		}
	}

	const placements1 = await placeBeaconsToFloorplans(beacons1, floorplan1, marketBeaconLocations);
	const campaignMappings1 = await createCampaigns(branch1.id, beacons1, marketCampaigns);
	generateRoutes(
		branch1.id,
		placements1,
		campaignMappings1,
		normalizeBeaconGraph(marketNotNormalizedBeaconGraph),
		500
	);
	await generateProductGroups(campaignMappings1); // generate only for branch that will be shown on demo app
	// await generateYesterdayEventsForDemoCustomer(
	// 	customerId,
	// 	branch1.id,
	// 	placements1,
	// 	campaignMappings1,
	// 	5000
	// ); // only for demo

	// ---------------------------------------------------------------------

	const branch2 = {
		id: crypto.randomUUID(),
		userId,
		address: 'Gordion',
		latitude: 39.900099,
		longitude: 32.691764
	};
	await db.insert(branches).values(branch2);

	const floorplan2 = {
		id: crypto.randomUUID(),
		branchId: branch2.id,
		imgPath: '/src/lib/assets/store_plans/market2.jpg',
		width: 1000,
		height: 1200
	};
	await db.insert(floorplans).values(floorplan2);

	const beacons2 = await initializePseudoBeacons(branch2.id, 2, 1, 10);
	const placements2 = await placeBeaconsToFloorplans(beacons2, floorplan2);
	const campaignMappings2 = await createCampaigns(branch2.id, beacons2);
	generateRandomEvents(branch2.id, floorplan2, beacons2, placements2, campaignMappings2, 100); // comment if clustering model will be trained

	// ---------------------------------------------------------------------

	const branch3 = {
		id: crypto.randomUUID(),
		userId,
		address: 'Bahcelievler',
		latitude: 39.922539,
		longitude: 32.825964
	};
	await db.insert(branches).values(branch3);

	const floorplan3 = {
		id: crypto.randomUUID(),
		branchId: branch3.id,
		imgPath: '/src/lib/assets/store_plans/market3.jpg',
		width: 1000,
		height: 1200
	};
	await db.insert(floorplans).values(floorplan3);

	const beacons3 = await initializePseudoBeacons(branch3.id, 3, 1, 10);
	const placements3 = await placeBeaconsToFloorplans(beacons3, floorplan3);
	const campaignMappings3 = await createCampaigns(branch3.id, beacons3);
	generateRandomEvents(branch3.id, floorplan3, beacons3, placements3, campaignMappings3, 100); // comment if clustering model will be trained

	// ---------------------------------------------------------------------

	const branch4 = {
		id: crypto.randomUUID(),
		userId,
		address: 'Dikmen',
		latitude: 39.877856,
		longitude: 32.83709
	};
	await db.insert(branches).values(branch4);

	const floorplan4 = {
		id: crypto.randomUUID(),
		branchId: branch4.id,
		imgPath: '/src/lib/assets/store_plans/market4.jpg',
		width: 1000,
		height: 1200
	};
	await db.insert(floorplans).values(floorplan4);

	const beacons4 = await initializePseudoBeacons(branch4.id, 4, 1, 10);
	const placements4 = await placeBeaconsToFloorplans(beacons4, floorplan4);
	const campaignMappings4 = await createCampaigns(branch4.id, beacons4);
	generateRandomEvents(branch4.id, floorplan4, beacons4, placements4, campaignMappings4, 100); // comment if clustering model will be trained
}

// DEMO 2 (Museum):

async function prepareMuseumDemo() {
	const user = await auth.createUser({
		key: {
			providerId: 'username', // auth method
			providerUserId: 'museum'.toLowerCase(), // unique id when using "username" auth method
			password: 'museum' // hashed by Lucia
		},
		attributes: {
			username: 'museum'
		}
	});
	const userId: string = user.userId;

	const branch1 = {
		id: crypto.randomUUID(),
		userId,
		address: 'Bilkent',
		latitude: 39.867891,
		longitude: 32.748718
	};
	await db.insert(branches).values(branch1);

	const floorplan1 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		imgPath: '/src/lib/assets/store_plans/museum.jpg',
		width: 1000,
		height: 1200
	};
	await db.insert(floorplans).values(floorplan1);

	const branch2 = {
		id: crypto.randomUUID(),
		userId,
		address: 'Polatli',
		latitude: 39.585002,
		longitude: 32.144671
	};
	await db.insert(branches).values(branch2);

	const floorplan2 = {
		id: crypto.randomUUID(),
		branchId: branch2.id,
		imgPath: '/src/lib/assets/store_plans/museum2.jpg',
		width: 1000,
		height: 1200
	};
	await db.insert(floorplans).values(floorplan2);
}

// DEMO 3 (Gym):

async function prepareGymDemo() {
	const user = await auth.createUser({
		key: {
			providerId: 'username', // auth method
			providerUserId: 'gym'.toLowerCase(), // unique id when using "username" auth method
			password: 'gym' // hashed by Lucia
		},
		attributes: {
			username: 'gym'
		}
	});
	const userId: string = user.userId;

	const branch1 = {
		id: crypto.randomUUID(),
		userId,
		address: 'Bilkent',
		latitude: 39.867891,
		longitude: 32.748718
	};
	await db.insert(branches).values(branch1);

	const floorplan1 = {
		id: crypto.randomUUID(),
		branchId: branch1.id,
		imgPath: '/src/lib/assets/store_plans/gym.jpg',
		width: 1500,
		height: 1100
	};
	await db.insert(floorplans).values(floorplan1);

	const branch2 = {
		id: crypto.randomUUID(),
		userId: userId,
		address: 'Bogaziçi',
		latitude: 41.085491,
		longitude: 29.044508
	};
	await db.insert(branches).values(branch2);

	const floorplan2 = {
		id: crypto.randomUUID(),
		branchId: branch2.id,
		imgPath: '/src/lib/assets/store_plans/gym2.jpg',
		width: 1500,
		height: 1100
	};
	await db.insert(floorplans).values(floorplan2);

	const branch3 = {
		id: crypto.randomUUID(),
		userId: userId,
		address: 'Ege Üniversitesi',
		latitude: 38.45772,
		longitude: 27.232992
	};
	await db.insert(branches).values(branch3);

	const floorplan3 = {
		id: crypto.randomUUID(),
		branchId: branch3.id,
		imgPath: '/src/lib/assets/store_plans/gym3.jpg',
		width: 1500,
		height: 1100
	};
	await db.insert(floorplans).values(floorplan3);
}

// DEMO 4 (Fair):

async function prepareFairDemo() {
	const user = await auth.createUser({
		key: {
			providerId: 'username', // auth method
			providerUserId: 'fair'.toLowerCase(), // unique id when using "username" auth method
			password: 'fair' // hashed by Lucia
		},
		attributes: {
			username: 'fair'
		}
	});
	const userId: string = user.userId;

	const branch = {
		id: crypto.randomUUID(),
		userId,
		address: 'Bilkent',
		latitude: 39.867891,
		longitude: 32.748718
	};
	await db.insert(branches).values(branch);

	const floorplan = {
		id: crypto.randomUUID(),
		branchId: branch.id,
		imgPath: '/src/lib/assets/store_plans/fair.jpg',
		width: 1500,
		height: 1100
	};
	await db.insert(floorplans).values(floorplan);
	let beacons = await initializeUWBBeacons(branch.id);
	const placements = await placeBeaconsToFloorplans(beacons, floorplan, fairBeaconLocations);
	const campaignMappings = await createCampaigns(branch.id, beacons, fairCampaigns);
	generateRandomEvents(branch.id, floorplan, beacons, placements, campaignMappings, 300); // comment if clustering model will be trained
}

async function initializeLokateBeacons(branchId: string) {
	const beacon1 = {
		id: crypto.randomUUID(),
		branchId,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 1,
		radius: 1.0,
		name: 'Pink'
	};
	await db.insert(beacons).values(beacon1);

	const beacon2 = {
		id: crypto.randomUUID(),
		branchId,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 2,
		radius: 1.0,
		name: 'Red'
	};
	await db.insert(beacons).values(beacon2);

	const beacon3 = {
		id: crypto.randomUUID(),
		branchId,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 3,
		radius: 1.0,
		name: 'White'
	};
	await db.insert(beacons).values(beacon3);

	const beacon4 = {
		id: crypto.randomUUID(),
		branchId,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 4,
		radius: 1.0,
		name: 'Yellow'
	};
	await db.insert(beacons).values(beacon4);

	return [beacon1, beacon2, beacon3, beacon4];
}

async function initializeUWBBeacons(branchId: string) {
	const beacon1 = {
		id: crypto.randomUUID(),
		branchId,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 5,
		radius: 3.0,
		name: 'uwb_caramel'
	};
	await db.insert(beacons).values(beacon1);

	const beacon2 = {
		id: crypto.randomUUID(),
		branchId,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 6,
		radius: 3.0,
		name: 'uwb_white'
	};
	await db.insert(beacons).values(beacon2);

	const beacon3 = {
		id: crypto.randomUUID(),
		branchId,
		proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
		major: 1,
		minor: 7,
		radius: 3.0,
		name: 'uwb_yellow'
	};
	await db.insert(beacons).values(beacon3);

	return [beacon1, beacon2, beacon3];
}

async function initializePseudoBeacons(
	branchId: string,
	major: number,
	startMinor: number,
	n: number
) {
	let pseudoBeacons = [];
	for (let i = 1; i <= n; i++) {
		const beacon = {
			id: crypto.randomUUID(),
			branchId,
			proximityUUID: '5D72CC30-5C61-4C09-889F-9AE750FA84EC',
			major,
			minor: startMinor++,
			// radius: Math.random() * 15,
			radius: 5.0, // default radius
			name: `Pseudo${i}`
		};
		await db.insert(beacons).values(beacon);
		pseudoBeacons.push(beacon);
	}

	return pseudoBeacons;
}

async function placeBeaconsToFloorplans(
	beacons: any,
	floorplan: any,
	predefinedLocations: any = null
) {
	const floorplanId = floorplan.id;
	let placements = [];
	for (let i = 0; i < beacons.length; i++) {
		const beaconId = beacons[i].id;
		let x: number, y: number;
		if (predefinedLocations != null) {
			x = predefinedLocations[i][0];
			y = predefinedLocations[i][1];
		} else {
			// if locations array is not specified, randomly place beacons
			const { floorplanImgWidth, floorplanImgHeight } = await getImageDimensions(floorplan.imgPath);
			x = Math.floor(Math.random() * floorplanImgWidth);
			y = Math.floor(Math.random() * floorplanImgHeight);
		}
		const placement = {
			beaconId,
			floorplanId,
			x,
			y
		};
		await db.insert(beaconsToFloorplans).values(placement);
		placements.push(placement);
	}

	return placements;
}

async function createCampaigns(branchId: string, beacons: any, predefinedCampaigns: any = null) {
	let campaignMappings = [];
	for (let i = 0; i < beacons.length; i++) {
		const beaconId = beacons[i].id;
		const campaignId = crypto.randomUUID();
		const campaignName = predefinedCampaigns != null ? predefinedCampaigns[i] : `Campaign${i + 1}`;
		await db.insert(campaigns).values({
			id: campaignId,
			branchId,
			name: campaignName,
			status: 'active'
		});
		const campaignMapping = {
			campaignId,
			beaconId
		};
		await db.insert(campaignsToBeacons).values(campaignMapping);
		campaignMappings.push(campaignMapping);
	}

	return campaignMappings;
}

async function generateRoutes(
	branchId: string,
	placements: any,
	campaignMappings: any,
	beaconGraph: number[][],
	n: number // total number of routes
) {
	let customerNo = 0;
	let customerId = '';
	for (let i = 0; i < n; i++) {
		// there will be (n / 30) customers, and each customer will have a route for each day of a month
		if (i % 30 == 0) {
			++customerNo;
			customerId = crypto.randomUUID();
			await db.insert(customers).values({
				id: customerId,
				customerId: `Customer${customerNo}`
			});
		}
		const route = generateSingleRoute(beaconGraph);
		await generateRouteEvents(
			placements,
			route,
			(i % 30) + 1, // day of the month
			customerId,
			branchId,
			campaignMappings
		);
		// console.log(route);
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

async function generateRouteEvents(
	placements: any,
	route: number[],
	day: number,
	customerId: string,
	branchId: string,
	campaignMappings: any
) {
	let routeEvents = [];
	const enterDay = new Date();
	// enterDay.setMonth(enterDay.getMonth());
	enterDay.setDate(enterDay.getDate() - day);

	for (let [i, beaconIdx] of route.entries()) {
		const { x, y } = placements[beaconIdx];

		enterDay.setHours(12, i, 0, 0);
		const enterTimestamp = new Date(enterDay.getTime());
		enterDay.setSeconds(30);
		const possibleExitTimestamp = new Date(enterDay.getTime());

		routeEvents.push({
			id: crypto.randomUUID(),
			status: EventStatus.EXIT,
			enterTimestamp,
			possibleExitTimestamp,
			locationX: x,
			locationY: y,
			radius: 5.0,
			customerId,
			branchId,
			beaconId: placements[beaconIdx].beaconId,
			campaignId: campaignMappings[beaconIdx].campaignId
		});
	}

	await db.insert(events).values(routeEvents);
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

async function generateRandomEvents(
	branchId: string,
	floorplan: any,
	beacons: any,
	placements: any,
	campaignMappings: any,
	n: number // number of events per each day
) {
	const customerId = crypto.randomUUID();
	await db.insert(customers).values({
		id: customerId,
		customerId: 'RandomEventGuy'
	});

	function getRandomTimestamp(start: Date, end: Date): Date {
		const startTime = start.getTime();
		const endTime = end.getTime();
		const randomTime = startTime + Math.random() * (endTime - startTime);
		return new Date(randomTime);
	}

	const { floorplanImgWidth, floorplanImgHeight } = await getImageDimensions(floorplan.imgPath);

	let randomEvents = [];

	// for the past week
	for (let i = 1; i < 7; i++) {
		// beacons will be placed to different locations with different radiuses on each day,
		// which means events will occur on different locations, but notice that this has nothing
		// to do with beacon placement on the floorplan, i.e. no update to beacons_to_floorplans table
		// it is just for populating heatmaps with some pseudo events happening on different locations
		const beaconPositions: { [key: string]: { x: number; y: number; r: number } } = {};

		for (let j = 0; j < beacons.length; j++) {
			let x: number, y: number, r: number;
			if (i == 0) {
				// today, use the actual placements
				x = placements[j].x;
				y = placements[j].y;
				r = beacons[j].radius;
			} else {
				// previous days, use random placements
				x = Math.floor(Math.random() * floorplanImgWidth);
				y = Math.floor(Math.random() * floorplanImgHeight);
				r = Math.random() * 15;
			}
			beaconPositions[beacons[j].id] = { x, y, r };
		}

		// generate n events for each day
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - i);
		startDate.setHours(8, 0, 0, 0); // Set start time to 8:00 AM
		const endDate = new Date();
		endDate.setDate(endDate.getDate() - i);
		endDate.setHours(22, 0, 0, 0); // Set end time to 10:00 PM

		for (let j = 0; j < n; j++) {
			const randomBeaconIdx = Math.floor(Math.random() * beacons.length);
			const beaconId = beacons[randomBeaconIdx].id;
			const campaignId = campaignMappings[randomBeaconIdx].campaignId;
			const { x, y, r } = beaconPositions[beaconId];
			const enterTimestamp = getRandomTimestamp(startDate, endDate); // Random timestamp within the specified range
			const possibleExitTimestamp = new Date(
				enterTimestamp.getTime() + Math.floor(Math.random() * 50000) + 10000
			);

			// 20% of events may remain at STAY status due to possible failure
			const eventStatus = j % 5 === 0 ? EventStatus.STAY : EventStatus.EXIT;
			randomEvents.push({
				id: crypto.randomUUID(),
				status: eventStatus,
				enterTimestamp,
				possibleExitTimestamp,
				locationX: x,
				locationY: y,
				radius: r,
				customerId,
				branchId,
				beaconId,
				campaignId
			});
		}
	}

	await db.insert(events).values(randomEvents);
}

async function generateProductGroups(campaignMappings: any) {
	const category_keys = [
		'seker_sakiz',
		'cikolata_biskuvi',
		'cips',
		'bebek', // 3
		'gevrek',
		'sampuan_dusjeli',
		'kuruyemis', // 6
		'kisisel_bakim',
		'camasir',
		'bulasik',
		'ev_temizligi',
		'makarna_pirinc_bakliyat',
		'hazirgida_baharat',
		'icecek', // 13
		'sabun',
		'kahve', // 15
		'sigara',
		'pasta',
		'peynir_tereyagi',
		'dondurulmus',
		'yumurta',
		'salam_sosis_sucuk',
		'cay',
		'alet',
		'sos',
		'ekmek',
		'sivi_yag',
		'meyve_sebze',
		'maden_suyu',
		'kolonya',
		'konserve_salca',
		'pecete',
		'mangal',
		'poset',
		'recel_bal',
		'porselen',
		'dondurma',
		'kedi_kopek',
		'plastik',
		'su',
		'sut',
		'ayran_yogurt',
		'pil'
	];

	const category1 = {
		id: crypto.randomUUID(),
		groupName: category_keys[3] // bebek
	};
	const match1 = {
		productGroupId: category1.id,
		campaignId: campaignMappings[3].campaignId // bebek bezi
	};
	await db.insert(productGroups).values(category1);
	await db.insert(productGroupsToCampaigns).values(match1);

	const category2 = {
		id: crypto.randomUUID(),
		groupName: category_keys[6] // kuruyemis
	};
	const match2 = {
		productGroupId: category2.id,
		campaignId: campaignMappings[6].campaignId // kuruyemis
	};
	await db.insert(productGroups).values(category2);
	await db.insert(productGroupsToCampaigns).values(match2);

	const category3 = {
		id: crypto.randomUUID(),
		groupName: category_keys[13] // icecek
	};
	const match3 = {
		productGroupId: category3.id,
		campaignId: campaignMappings[13].campaignId // bira
	};
	await db.insert(productGroups).values(category3);
	await db.insert(productGroupsToCampaigns).values(match3);

	const category4 = {
		id: crypto.randomUUID(),
		groupName: category_keys[15] // kahve
	};
	const match4 = {
		productGroupId: category4.id,
		campaignId: campaignMappings[15].campaignId // kahve
	};
	await db.insert(productGroups).values(category4);
	await db.insert(productGroupsToCampaigns).values(match4);

	const forbidden_indexes = [3, 6, 13, 15];

	// first 4 categories are already matched
	for (let i = 4; i < category_keys.length; i++) {
		const category = {
			id: crypto.randomUUID(),
			groupName: category_keys[i]
		};
		await db.insert(productGroups).values(category);

		// avoid forbidded indexes
		let campaignIdx = Math.floor(Math.random() * campaignMappings.length);
		while (forbidden_indexes.includes(campaignIdx)) {
			campaignIdx = Math.floor(Math.random() * campaignMappings.length);
		}
		// randomly match remaining categories (we don't care)
		const match = {
			campaignId: campaignMappings[campaignIdx].campaignId,
			productGroupId: category.id
		};
		await db.insert(productGroupsToCampaigns).values(match);
	}
}

async function generateYesterdayEventsForDemoCustomer(
	customerId: string,
	branchId: string,
	placements: any,
	campaignMappings: any,
	n: number
) {
	function getRandomTimestamp(start: Date, end: Date): Date {
		const startTime = start.getTime();
		const endTime = end.getTime();
		const randomTime = startTime + Math.random() * (endTime - startTime);
		return new Date(randomTime);
	}

	// events will be generated for campaigns with indexes 1, 2, 3, 15 (bebek bezi, kuruyemis, bira, kahve)
	const indexes = [3, 6, 13, 15];

	let yesterdayEvents = [];

	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 1);
	startDate.setHours(8, 0, 0, 0); // Set start time to 8:00 AM
	const endDate = new Date();
	endDate.setDate(endDate.getDate() - 1);
	endDate.setHours(22, 0, 0, 0); // Set end time to 10:00 PM

	for (let j = 0; j < n; j++) {
		const randomIdx = indexes[Math.floor(Math.random() * indexes.length)];
		const beaconId = placements[randomIdx].beaconId;
		const campaignId = campaignMappings[randomIdx].campaignId;
		const x = placements[randomIdx].x;
		const y = placements[randomIdx].y;
		const r = 5.0;
		const enterTimestamp = getRandomTimestamp(startDate, endDate); // Random timestamp within the specified range
		const possibleExitTimestamp = new Date(
			enterTimestamp.getTime() + Math.floor(Math.random() * 50000) + 10000
		);

		// 20% of events may remain at STAY status due to possible failure
		const eventStatus = j % 5 === 0 ? EventStatus.STAY : EventStatus.EXIT;
		yesterdayEvents.push({
			id: crypto.randomUUID(),
			status: eventStatus,
			enterTimestamp,
			possibleExitTimestamp,
			locationX: x,
			locationY: y,
			radius: r,
			customerId,
			branchId,
			beaconId,
			campaignId
		});
	}

	await db.insert(events).values(yesterdayEvents);
}

/* CUSTOM DATA (NOT RANDOM) */

// Annotated (BeaconName)
const marketBeaconLocations = [
	[425, 339], // Entry (Pink)
	[617, 324], // 1 (Pseudo1)
	[693, 322], // 2 (Pseudo2)
	[604, 262], // 3 (Red)
	[679, 251], // 4 (Pseudo3)
	[648, 116], // 5 (Pseudo4)
	[559, 32], // 6 (White)
	[548, 221], // 7 (Pseudo5)
	[501, 179], // 8 (Pseudo6)
	[432, 60], // 9 (Pseudo7)
	[453, 223], // 10 (Pseudo8)
	[405, 177], // 11 (Pseudo9)
	[386, 108], // 12 (Pseudo10)
	[366, 37], // 13 (Yellow)
	[357, 224], // 14 (Pseudo11)
	[314, 181], // 15 (Pseudo12)
	[279, 107], // 16 (Pseudo13)
	[269, 200], // 17 (Pseudo14)
	[225, 154], // 18 (Pseudo15)
	[227, 220], // 19 (Pseudo16)
	[200, 255], // 20 (Pseudo17)
	[161, 108], // 21 (Pseudo18)
	[20, 272], // 22 (Pseudo19)
	[72, 297], // 23 (Pseudo20)
	[37, 327], // 24 (Pseudo21)
	[200, 338] // Exit (Pseudo22)
];
const marketCampaigns = [
	'giris', // pink
	'ekmek',
	'bakliyat',
	'bebek bezi', // red
	'konserve',
	'kasap',
	'kuruyemis', // white
	'icecek',
	'bulasik',
	'deterjan',
	'sut',
	'cay',
	'dondurma',
	'bira', // yellow
	'cips',
	'kahve',
	'cikolata',
	'dondurulmus hazir gida',
	'kisisel bakim',
	'sarap',
	'kasa',
	'sandvic',
	'kagit',
	'kalem',
	'defter',
	'cikis'
];

// BEER
// entry -> bebek bezi -> kuruyemis -> bira -> kahve -> exit
// entry -> 3 -> 6 -> 13 -> 15 -> exit
const marketNotNormalizedBeaconGraph: number[][] = [
	/* 0*/ [0, 7, 3, 999, 2, 0, 0, 8, 6, 1, 9, 5, 3, 0, 8, 6, 2, 5, 2, 5, 6, 0, 2, 7, 2, 0],
	/* 1*/ [0, 0, 8, 9, 6, 2, 0, 5, 4, 2, 7, 5, 2, 0, 5, 4, 2, 3, 0, 3, 6, 0, 3, 4, 3, 3],
	/* 2*/ [0, 5, 0, 6, 8, 3, 0, 2, 0, 3, 3, 2, 2, 0, 3, 0, 0, 0, 0, 4, 5, 0, 0, 3, 4, 2],
	/* 3*/ [0, 3, 2, 0, 9, 7, 999, 10, 4, 5, 8, 3, 3, 2, 5, 3, 0, 2, 0, 3, 4, 0, 2, 6, 2, 6],
	/* 4*/ [0, 2, 3, 4, 0, 8, 6, 4, 5, 4, 2, 3, 5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
	/* 5*/ [0, 2, 2, 4, 3, 0, 9, 5, 4, 3, 0, 3, 3, 2, 0, 0, 0, 0, 3, 4, 4, 0, 0, 2, 0, 2],
	/* 6*/ [0, 0, 0, 2, 2, 3, 0, 6, 8, 10, 4, 5, 6, 999, 3, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0],
	/* 7*/ [0, 6, 2, 7, 5, 6, 8, 3, 10, 3, 4, 2, 6, 4, 3, 3, 2, 0, 2, 2, 4, 0, 2, 5, 2, 3],
	/* 8*/ [0, 2, 0, 2, 3, 4, 8, 6, 0, 6, 7, 5, 6, 3, 2, 2, 3, 2, 2, 0, 0, 0, 0, 0, 0, 2],
	/* 9*/ [0, 0, 0, 0, 0, 5, 8, 4, 6, 0, 10, 2, 5, 8, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	/*10*/ [0, 7, 3, 5, 2, 0, 6, 6, 8, 2, 0, 7, 5, 0, 5, 2, 2, 2, 3, 3, 5, 2, 0, 4, 2, 4],
	/*11*/ [0, 2, 0, 2, 0, 5, 7, 4, 7, 5, 8, 0, 8, 2, 7, 5, 4, 2, 3, 0, 0, 2, 2, 4, 3, 4],
	/*12*/ [0, 0, 2, 3, 3, 5, 8, 3, 6, 6, 4, 7, 0, 2, 6, 4, 7, 2, 2, 2, 0, 2, 0, 0, 2, 0],
	/*13*/ [0, 0, 0, 0, 2, 4, 5, 3, 5, 10, 2, 2, 3, 0, 0, 999, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	/*14*/ [0, 3, 2, 2, 0, 0, 2, 2, 2, 3, 5, 7, 6, 0, 0, 7, 3, 3, 2, 5, 6, 0, 2, 4, 3, 5],
	/*15*/ [0, 0, 0, 0, 0, 2, 3, 0, 2, 2, 3, 5, 6, 2, 8, 0, 9, 8, 4, 3, 3, 4, 3, 4, 2, 999],
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

const fairBeaconLocations = [
	[100, 100], // uwb_caramel
	[200, 200], // uwb_white
	[300, 300] // uwb_yellow
];
const fairCampaigns = ['uwb_caramel', 'uwb_white', 'uwb_yellow'];

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

// 2 ROUTES
// const marketNotNormalizedBeaconGraph: number[][] = [
// 	/* 0*/ [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/* 1*/ [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/* 2*/ [0, 5, 0, 6, 8, 3, 0, 2, 0, 3, 3, 2, 2, 0, 3, 0, 0, 0, 0, 4, 5, 0, 0, 3, 4, 2],
// 	/* 3*/ [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/* 4*/ [0, 2, 3, 4, 0, 8, 6, 4, 5, 4, 2, 3, 5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
// 	/* 5*/ [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/* 6*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/* 7*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/* 8*/ [0, 2, 0, 2, 3, 4, 8, 6, 0, 6, 7, 5, 6, 3, 2, 2, 3, 2, 2, 0, 0, 0, 0, 0, 0, 2],
// 	/* 9*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
// 	/*10*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/*11*/ [0, 2, 0, 2, 0, 5, 7, 4, 7, 5, 8, 0, 8, 2, 7, 5, 4, 2, 3, 0, 0, 2, 2, 4, 3, 4],
// 	/*12*/ [0, 0, 2, 3, 3, 5, 8, 3, 6, 6, 4, 7, 0, 2, 6, 4, 7, 2, 2, 2, 0, 2, 0, 0, 2, 0],
// 	/*13*/ [0, 0, 0, 0, 2, 4, 5, 3, 5, 10, 2, 2, 3, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/*14*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
// 	/*15*/ [0, 0, 0, 0, 0, 2, 3, 0, 2, 2, 3, 5, 6, 2, 8, 0, 9, 8, 4, 3, 3, 4, 3, 4, 2, 5],
// 	/*16*/ [0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 3, 4, 6, 2, 3, 8, 0, 7, 8, 3, 2, 7, 2, 3, 0, 2],
// 	/*17*/ [0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 3, 4, 2, 3, 6, 7, 0, 8, 9, 4, 3, 0, 3, 2, 5],
// 	/*18*/ [0, 0, 0, 0, 0, 2, 2, 2, 4, 2, 3, 2, 3, 0, 2, 3, 7, 8, 0, 8, 4, 9, 0, 5, 2, 3],
// 	/*19*/ [0, 2, 0, 0, 0, 0, 2, 0, 2, 3, 2, 3, 2, 0, 6, 5, 5, 8, 8, 0, 10, 6, 2, 4, 5, 7],
// 	/*20*/ [0, 3, 2, 3, 0, 0, 0, 2, 2, 0, 3, 3, 2, 0, 5, 6, 4, 4, 5, 8, 0, 6, 2, 6, 3, 9],
// 	/*21*/ [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 4, 5, 3, 7, 6, 8, 0, 0, 5, 2, 6],
// 	/*22*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 3],
// 	/*23*/ [0, 3, 2, 4, 2, 0, 0, 0, 0, 0, 3, 2, 2, 0, 4, 3, 2, 4, 2, 3, 8, 6, 7, 0, 24, 7],
// 	/*24*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 0, 2, 4, 3, 6, 8, 0, 10],
// 	/*25*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
// ];

// LAST TRAINED MODEL
// const marketNotNormalizedBeaconGraph: number[][] = [
// 	/* 0*/ [0, 7, 3, 6, 2, 0, 0, 8, 6, 1, 9, 5, 3, 0, 8, 6, 2, 5, 2, 5, 6, 0, 2, 7, 2, 0],
// 	/* 1*/ [0, 0, 8, 9, 6, 2, 0, 5, 4, 2, 7, 5, 2, 0, 5, 4, 2, 3, 0, 3, 6, 0, 3, 4, 3, 3],
// 	/* 2*/ [0, 5, 0, 6, 8, 3, 0, 2, 0, 3, 3, 2, 2, 0, 3, 0, 0, 0, 0, 4, 5, 0, 0, 3, 4, 2],
// 	/* 3*/ [0, 3, 2, 0, 9, 7, 3, 10, 4, 5, 8, 3, 3, 2, 5, 3, 0, 2, 0, 3, 4, 0, 2, 6, 2, 6],
// 	/* 4*/ [0, 2, 3, 4, 0, 8, 6, 4, 5, 4, 2, 3, 5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
// 	/* 5*/ [0, 2, 2, 4, 3, 0, 9, 5, 4, 3, 0, 3, 3, 2, 0, 0, 0, 0, 3, 4, 4, 0, 0, 2, 0, 2],
// 	/* 6*/ [0, 0, 0, 2, 2, 3, 0, 6, 8, 10, 4, 5, 6, 7, 3, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0],
// 	/* 7*/ [0, 6, 2, 7, 5, 6, 8, 3, 10, 3, 4, 2, 6, 4, 3, 3, 2, 0, 2, 2, 4, 0, 2, 5, 2, 3],
// 	/* 8*/ [0, 2, 0, 2, 3, 4, 8, 6, 0, 6, 7, 5, 6, 3, 2, 2, 3, 2, 2, 0, 0, 0, 0, 0, 0, 2],
// 	/* 9*/ [0, 0, 0, 0, 0, 5, 8, 4, 6, 0, 10, 2, 5, 8, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/*10*/ [0, 7, 3, 5, 2, 0, 6, 6, 8, 2, 0, 7, 5, 0, 5, 2, 2, 2, 3, 3, 5, 2, 0, 4, 2, 4],
// 	/*11*/ [0, 2, 0, 2, 0, 5, 7, 4, 7, 5, 8, 0, 8, 2, 7, 5, 4, 2, 3, 0, 0, 2, 2, 4, 3, 4],
// 	/*12*/ [0, 0, 2, 3, 3, 5, 8, 3, 6, 6, 4, 7, 0, 2, 6, 4, 7, 2, 2, 2, 0, 2, 0, 0, 2, 0],
// 	/*13*/ [0, 0, 0, 0, 2, 4, 5, 3, 5, 10, 2, 2, 3, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// 	/*14*/ [0, 3, 2, 2, 0, 0, 2, 2, 2, 3, 5, 7, 6, 0, 0, 7, 3, 3, 2, 5, 6, 0, 2, 4, 3, 5],
// 	/*15*/ [0, 0, 0, 0, 0, 2, 3, 0, 2, 2, 3, 5, 6, 2, 8, 0, 9, 8, 4, 3, 3, 4, 3, 4, 2, 5],
// 	/*16*/ [0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 3, 4, 6, 2, 3, 8, 0, 7, 8, 3, 2, 7, 2, 3, 0, 2],
// 	/*17*/ [0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 3, 4, 2, 3, 6, 7, 0, 8, 9, 4, 3, 0, 3, 2, 5],
// 	/*18*/ [0, 0, 0, 0, 0, 2, 2, 2, 4, 2, 3, 2, 3, 0, 2, 3, 7, 8, 0, 8, 4, 9, 0, 5, 2, 3],
// 	/*19*/ [0, 2, 0, 0, 0, 0, 2, 0, 2, 3, 2, 3, 2, 0, 6, 5, 5, 8, 8, 0, 10, 6, 2, 4, 5, 7],
// 	/*20*/ [0, 3, 2, 3, 0, 0, 0, 2, 2, 0, 3, 3, 2, 0, 5, 6, 4, 4, 5, 8, 0, 6, 2, 6, 3, 9],
// 	/*21*/ [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 4, 5, 3, 7, 6, 8, 0, 0, 5, 2, 6],
// 	/*22*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 3],
// 	/*23*/ [0, 3, 2, 4, 2, 0, 0, 0, 0, 0, 3, 2, 2, 0, 4, 3, 2, 4, 2, 3, 8, 6, 7, 0, 24, 7],
// 	/*24*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 0, 2, 4, 3, 6, 8, 0, 10],
// 	/*25*/ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
// ];
