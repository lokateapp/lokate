import dayjs from 'dayjs';
import type { RequestHandler } from './$types';
import { beacons, branches, campaigns, campaignsToBeacons, events } from '$lib/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const branchId = url.searchParams.get('branchId');
	if (!branchId) {
		return json({ error: 'BranchId is required' }, { status: 400 });
	}
	// const from = url.searchParams.get('from');
	// const to = url.searchParams.get('to');

	const offset = url.searchParams.get('offset');
	const limit = url.searchParams.get('limit');

	// console.log('offset: ', offset, 'limit: ', limit);

	// let dateFrom: Date = dayjs(new Date())
	// 	.subtract(6, 'day')
	// 	.set('hour', 0)
	// 	.set('minute', 0)
	// 	.set('second', 0)
	// 	.toDate();
	// let dateTo: Date = new Date();

	// if (from?.length && from.length > 0 && from !== 'null') {
	// 	dateFrom = new Date(from);
	// }
	// if (to?.length && to.length > 0 && to !== 'null') {
	// 	dateTo = new Date(to);
	// }

	let branch = await db.query.branches.findFirst({ where: eq(branches.id, branchId) });
	if (!branch) {
		return json({ error: 'Branch not found' }, { status: 500 });
	}

	const totalEventCount = (
		await db
			.select()
			.from(events)
			.innerJoin(beacons, eq(events.beaconId, beacons.id))
			.innerJoin(campaignsToBeacons, eq(beacons.id, campaignsToBeacons.beaconId))
			.innerJoin(campaigns, eq(campaignsToBeacons.campaignId, campaigns.id))
			.where(eq(campaigns.branchId, branchId))
	).length;

	const selectedEvents = await db
		.select()
		.from(events)
		.innerJoin(beacons, eq(events.beaconId, beacons.id))
		.innerJoin(campaignsToBeacons, eq(beacons.id, campaignsToBeacons.beaconId))
		.innerJoin(campaigns, eq(campaignsToBeacons.campaignId, campaigns.id))
		.where(eq(campaigns.branchId, branchId))
		.limit(limit ? parseInt(limit) : 10)
		.offset(offset ? parseInt(offset) * (limit ? parseInt(limit) : 10) : 0);

	const concatenatedEvents = selectedEvents.map((event) => {
		return {
			...event['beacons'],
			...event['campaigns'],
			...event['events']
		};
	});

	return json({ selectedEvents: concatenatedEvents, totalEventCount });
};
