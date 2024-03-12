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
			.select({ id: beacons.id })
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
		const customer = await getCustomer(customerId);

		let success = true;
		if (status === EventStatus.ENTER) {
			success = await handleEnterEvent(timestamp, customer.id, beaconId);
		} else if (status === EventStatus.STAY) {
			success = await handleStayEvent(timestamp, customer.id, beaconId);
		} else if (status === EventStatus.EXIT) {
			success = await handleExitEvent(customer.id, beaconId);
		}

		if (!success && status === EventStatus.STAY) {
			console.log('Failed stay event for beacon: ' + beaconId + ', for customerId: ' + customerId);
		} else if (!success && (status === EventStatus.ENTER || status === EventStatus.EXIT)) {
			// all campaigns are not existed yet or not exist any
			return new Response('Failed event', { status: 500 });
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
const handleEnterEvent = async (timestamp, customerId, beaconId) => {
	const newEvent = {
		id: crypto.randomUUID(),
		status: EventStatus.STAY,
		enterTimestamp: new Date(timestamp),
		possibleExitTimestamp: new Date(timestamp + 10000), // Add 10 seconds
		customerId: customerId,
		beaconId: beaconId
	};
	await db.insert(events).values(newEvent);
	return true; // Return true for successful events
};
const handleStayEvent = async (timestamp, customerId, beaconId) => {
	const event = await db
		.select()
		.from(events)
		.where(
			and(
				eq(events.customerId, customerId),
				eq(events.beaconId, beaconId),
				eq(events.status, EventStatus.STAY)
			)
		)
		.limit(1);

	if (event.length === 0 || event[0].possibleExitTimestamp >= new Date(timestamp)) {
		return false;
	}

	await db
		.update(events)
		.set({ possibleExitTimestamp: new Date(timestamp) })
		.where(and(eq(events.id, event[0].id)));
	return true; // Return true for successful events
};

const handleExitEvent = async (customerId, beaconId) => {
	const event = await db
		.select()
		.from(events)
		.where(
			and(
				eq(events.customerId, customerId),
				eq(events.beaconId, beaconId),
				eq(events.status, EventStatus.STAY)
			)
		)
		.limit(1);

	if (event.length === 0) {
		return false;
	}

	await db
		.update(events)
		.set({ status: EventStatus.EXIT })
		.where(and(eq(events.id, event[0].id))); // TODO fix the warning for new Date..
	return true; // Return true for successful events
};
