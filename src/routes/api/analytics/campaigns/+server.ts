import dayjs from 'dayjs';
import type { RequestHandler } from './$types';
import { branches, campaigns, events, EventStatus } from '$lib/schema';
import { db } from '$lib/server/db';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const branchId = url.searchParams.get('branchId');
	if (!branchId) {
		return json({ error: 'BranchId is required' }, { status: 400 });
	}
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');

	let dateFrom: Date = dayjs(new Date())
		.subtract(6, 'day')
		.set('hour', 0)
		.set('minute', 0)
		.set('second', 0)
		.toDate();
	let dateTo: Date = new Date();

	if (from?.length && from.length > 0 && from !== 'null') {
		dateFrom = new Date(from);
	}
	if (to?.length && to.length > 0 && to !== 'null') {
		dateTo = new Date(to);
	}

	// console.log('from: ', dateFrom, 'to: ', dateTo, 'branchId: ', branchId);

	let branch = await db.query.branches.findFirst({ where: eq(branches.id, branchId) });
	if (!branch) {
		return json({ error: 'Branch not found' }, { status: 500 });
	}

	const campaignsUsage = await db
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
				gt(events.enterTimestamp, dateFrom),
				lt(events.possibleExitTimestamp, dateTo)
			)
		)
		.groupBy(campaigns.id, sql`DATE_TRUNC('day', ${events.enterTimestamp})`)
		.orderBy(campaigns.id);

	const customerUsage = await db
		.select({
			count: sql<number>`COUNT(DISTINCT ${events.customerId})`,
			date: sql<Date>`DATE_TRUNC('day', ${events.enterTimestamp})`
		})
		.from(events)
		.where(
			and(
				eq(events.branchId, branchId),
				eq(events.status, EventStatus.EXIT),
				gt(events.enterTimestamp, dateFrom),
				lt(events.possibleExitTimestamp, dateTo)
			)
		)
		.groupBy(sql`DATE_TRUNC('day', ${events.enterTimestamp})`)
		.orderBy(sql`DATE_TRUNC('day', ${events.enterTimestamp})`);

	return json({ campaignsUsage, customerUsage });
};
