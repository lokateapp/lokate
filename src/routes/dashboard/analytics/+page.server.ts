import type { RequestHandler } from '@sveltejs/kit';
import { db } from '../../../lib/server/db';
import { events, campaigns, customers, type SelectEvents } from '../../../schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	const events = await getEvents(session.user.userId);

    const concatenatedEvents = events.map((event) => {
        return {
            ...event["campaigns"],
            ...event["events"],
            // ...event["customers"],
        }
    })

    console.log('concatenatedEvents: ', concatenatedEvents);

    // concatenatedEvents.push({
    //     id: '00000000-0000-0000-0000-000000000000',
    //     name: 'test campaign1',
    //     status: 'ENTER',
    //     timestamp: '2021-08-01T00:00:00.000Z',
    //     customerId: '00000000-0000-0000-0000-000000000000',
    //     campaignId: '00000000-0000-0000-0000-000000000000',
    // });

	return { events: concatenatedEvents };
};

async function getEvents(userId: string): Promise<SelectEvents[]> {
	return await db
		.select()
		.from(events)
		.innerJoin(campaigns, eq(events.campaignId, campaigns.id))
		// .innerJoin(customers, eq(events.customerId, customers.id))
		.where(eq(campaigns.userId, userId));
}
