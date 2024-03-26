import type { RequestHandler } from './$types';
import { beacons, campaignsToBeacons, customers, events } from '../../../schema';
import { db } from '../../../lib/server/db';
import { and, eq } from 'drizzle-orm';

enum EventStatus {
	ENTER = 'ENTER',
	EXIT = 'EXIT',
	STAY = 'STAY'
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { customerId, beaconUUID, major, minor, status, timestamp } = await request.json();

		// Get the beacon ID based on beaconUUID, major, and minor
		const beacon = await db
			.select()
			.from(beacons)
			.where(
				and(
					eq(beacons.proximityUUID, beaconUUID),
					eq(beacons.major, major),
					eq(beacons.minor, minor)
				)
			);

		if (beacon.length === 0) {
			return new Response('Beacon not found for the provided parameters', { status: 404 });
		}

		const beaconId = beacon[0].id;
		const beaconRadius = beacon[0].radius;
		const branchId = beacon[0].branchId;
		const customer = await getCustomer(customerId);

		// Get the campaign ID that is currently assigned to the given beaconUUID from campaignsToBeacons
		const campaigns = await db
			.select({ campaignId: campaignsToBeacons.campaignId })
			.from(campaignsToBeacons)
			.where(eq(campaignsToBeacons.beaconId, beaconId));

		if (campaigns.length === 0) {
			return new Response('Campaign not found for the provided beaconUUID', { status: 404 });
		}

		const failedEvents = [];
		for (const campaign of campaigns) {
			const campaignId = campaign.campaignId;
			let failedEvent = null;
			if (status === EventStatus.ENTER) {
				failedEvent = await handleEnterEvent(
					timestamp,
					customer.id,
					branchId,
					campaignId,
					beaconId,
					beaconRadius
				);
			} else if (status === EventStatus.STAY) {
				failedEvent = await handleStayEvent(timestamp, customer.id, campaignId, beaconId);
			} else if (status === EventStatus.EXIT) {
				failedEvent = await handleExitEvent(customer.id, campaignId, beaconId);
			}

			if (failedEvent !== null) {
				failedEvents.push(failedEvent);
			}
		}

		for (const failedEvent of failedEvents) {
			console.log('Failed event for campaign: ' + failedEvent + 'for customerId: ' + customerId);
		}

		if (failedEvents.length === campaigns.length) {
			// all campaigns are not existed yet or not exist any
			return new Response('Failed to add customer to any campaign', { status: 500 });
		}

		const response =
			'customer with id:' +
			customer.id +
			' is added to campaign of beacon with proximity id: ' +
			beaconUUID +
			':' +
			major +
			':' +
			minor;
		return new Response(response, { status: 200 });
	} catch (error) {
		console.error('Error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};

const getCustomer = async (customerId) => {
	const retrivedCustomer = await db
		.select()
		.from(customers)
		.where(eq(customers.customerId, customerId))
		.limit(1);
	let customer = retrivedCustomer[0];
	if (customer === undefined || customer.length === 0) {
		customer = handleCreateNewUser(customerId);
	}
	return customer;
};

const handleCreateNewUser = async (customerId) => {
	const newCustomer = {
		id: crypto.randomUUID(),
		customerId: customerId
	};
	await db.insert(customers).values(newCustomer);
	return newCustomer;
};

const handleEnterEvent = async (
	timestamp,
	customerId,
	branchId,
	campaignId,
	beaconId,
	beaconRadius
) => {
	const { x, y } = await findCurrentBeaconPosition(beaconId);
	if (x == 0 || y == 0) {
		console.log('Beacon has not been placed yet');
		return campaignId;
	}
	const newEvent = {
		id: crypto.randomUUID(),
		status: EventStatus.STAY,
		enterTimestamp: new Date(timestamp),
		possibleExitTimestamp: new Date(timestamp + 10000), // Add 10 seconds
		locationX: x,
		locationY: y,
		radius: beaconRadius,
		branchId,
		customerId,
		beaconId,
		campaignId
	};
	await db.insert(events).values(newEvent);
	return null; // Return null for successful events
};

const handleStayEvent = async (timestamp, customerId, campaignId, beaconId) => {
	const event = await db
		.select()
		.from(events)
		.where(
			and(
				eq(events.customerId, customerId),
				eq(events.campaignId, campaignId),
				eq(events.beaconId, beaconId),
				eq(events.status, EventStatus.STAY)
			)
		)
		.limit(1);

	if (event.length === 0 || event[0].possibleExitTimestamp >= new Date(timestamp)) {
		return campaignId;
	}

	await db
		.update(events)
		.set({ possibleExitTimestamp: new Date(timestamp) })
		.where(and(eq(events.id, event[0].id)));
	return null; // Return null for successful events
};

const handleExitEvent = async (customerId, campaignId, beaconId) => {
	const event = await db
		.select()
		.from(events)
		.where(
			and(
				eq(events.customerId, customerId),
				eq(events.campaignId, campaignId),
				eq(events.beaconId, beaconId),
				eq(events.status, EventStatus.STAY)
			)
		)
		.limit(1);

	if (event.length === 0) {
		return campaignId;
	}

	await db
		.update(events)
		.set({ status: EventStatus.EXIT })
		.where(and(eq(events.id, event[0].id))); // TODO fix the warning for new Date..
	return null; // Return null for successful events
};

async function findCurrentBeaconPosition(beaconId: string) {
	const beaconPositionOnFloorplan = await db.query.beaconsToFloorplans.findFirst({
		where: (bf, { eq }) => eq(bf.beaconId, beaconId)
	});

	const { x, y } = beaconPositionOnFloorplan || { x: 0, y: 0 };

	return { x, y };
}
