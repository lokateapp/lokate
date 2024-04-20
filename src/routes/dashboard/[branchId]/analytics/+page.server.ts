import { db } from '$lib/server/db';
import { events, beacons, campaigns, campaignsToBeacons, EventStatus } from '$lib/schema';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import dayjs from 'dayjs';
import type { Actions } from '@sveltejs/kit';

export const ssr = false;
export const csr = true;

export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;
	const events = await getEvents(branchId);

	const allBeacons = await getBeacons(branchId);
	const allCampaigns = await getCampaigns(branchId);

	const campaignsUsage = await getCampaignsUsage(branchId);
	// console.log('campaignsUsage: ', campaignsUsage);

	const customersUsage = await calculateCustomers(branchId);
	// console.log('customers: ', customersUsage);

	//turn all beacons into object where key is beacon id and value is beacon.name
	const beaconsObject = allBeacons.reduce((acc: Record<string, string>, beacon) => {
		acc[beacon.id] = beacon.name || '';
		return acc;
	}, {});

	const campaignsObject = allCampaigns.reduce((acc: Record<string, string>, campaign) => {
		acc[campaign.id] = campaign.name || '';
		return acc;
	}, {});

	const concatenatedEvents = events.map((event) => {
		return {
			...event['beacons'],
			...event['campaigns'],
			...event['events']
			// ...event["customers"],
		};
	});

	// console.log('concatenatedEvents: ', concatenatedEvents);

	return {
		events: concatenatedEvents,
		beaconsObject: beaconsObject,
		campaignsObject: campaignsObject,
		allCampaigns: allCampaigns,
		campaignsUsage: campaignsUsage,
		customersUsage: customersUsage
	};
};

async function getEvents(branchId: string) {
	return await db
		.select()
		.from(events)
		.innerJoin(beacons, eq(events.beaconId, beacons.id))
		.innerJoin(campaignsToBeacons, eq(beacons.id, campaignsToBeacons.beaconId))
		.innerJoin(campaigns, eq(campaignsToBeacons.campaignId, campaigns.id))
		// .innerJoin(customers, eq(events.customerId, customers.id))
		.where(eq(campaigns.branchId, branchId))
		.limit(10);
}

async function getBeacons(branchId: string) {
	return await db
		.select()
		.from(beacons)
		.where(eq(beacons.branchId, branchId))
		.orderBy(beacons.name);
}

async function getCampaigns(branchId: string) {
	return await db
		.select()
		.from(campaigns)
		.where(eq(campaigns.branchId, branchId))
		.orderBy(campaigns.name);
}

async function getCampaignsUsage(
	branchId: string,
	from = dayjs(new Date())
		.subtract(6, 'day')
		.set('hour', 0)
		.set('minute', 0)
		.set('second', 0)
		.toDate(),
	to = new Date()
) {
	return await db
		.select({
			id: campaigns.id,
			name: campaigns.name,
			count: sql<number>`COUNT(${events.id})`,
			date: sql<Date>`DATE_TRUNC('day', ${events.enterTimestamp})`
			// date: sql<Date>`DATE_TRUNC('day', ${events.enterTimestamp})`
		})
		.from(campaigns)
		.innerJoin(events, eq(campaigns.id, events.campaignId))
		.where(
			and(
				eq(campaigns.branchId, branchId),
				eq(events.status, EventStatus.EXIT),
				gt(events.enterTimestamp, from),
				lt(events.possibleExitTimestamp, to)
			)
		)
		.groupBy(campaigns.id, sql`DATE_TRUNC('day', ${events.enterTimestamp})`)
		.orderBy(campaigns.id);
}

//calculate number of unique customers that visited the branch
async function calculateCustomers(
	branchId: string,
	from = dayjs(new Date())
		.subtract(6, 'day')
		.set('hour', 0)
		.set('minute', 0)
		.set('second', 0)
		.toDate(),
	to = new Date()
): Promise<{ count: number; date: Date }[]> {
	return await db
		.select({
			count: sql<number>`COUNT(DISTINCT ${events.customerId})`,
			date: sql<Date>`DATE_TRUNC('day', ${events.enterTimestamp})`
		})
		.from(events)
		.where(
			and(
				eq(events.branchId, branchId),
				eq(events.status, EventStatus.EXIT),
				gt(events.enterTimestamp, from),
				lt(events.possibleExitTimestamp, to)
			)
		)
		.groupBy(sql`DATE_TRUNC('day', ${events.enterTimestamp})`)
		.orderBy(sql`DATE_TRUNC('day', ${events.enterTimestamp})`);
}

export const actions: Actions = {};
