import type { RequestHandler } from '@sveltejs/kit';
import { db } from '../../../lib/server/db';
import { events, campaigns, customers, type SelectEvents } from '../../../schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	const events = await getEvents(session.user.userId);

	console.log('events: ', events);

	return { events };
};

async function getEvents(userId: string): Promise<SelectEvents[]> {
	return await db
		.select()
		.from(events)
		.innerJoin(campaigns, eq(events.campaignId, campaigns.id))
		.innerJoin(customers, eq(events.customerId, customers.id))
		.where(eq(campaigns.userId, userId));
}
