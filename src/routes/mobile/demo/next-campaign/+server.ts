import type { RequestHandler } from './$types';
import { customers } from '$lib/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

const VISIT_ANALYTICS_URL = 'http://localhost:8000/visit-analytics';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const customerId = url.searchParams.get('customerId');
		const customer = await db
			.select()
			.from(customers)
			.where(eq(customers.customerId, customerId!))
			.limit(1);

		if (customer.length === 0) {
			throw new Error('Unknown customer');
		}

		const response = await fetch(`${VISIT_ANALYTICS_URL}/${customer[0].id}`);

		if (!response.ok) {
			throw new Error(`ML Backend (visit analytics) error: ${await response.text()}`);
		}

		const responseObject = {
			nextCampaignName: ''
		};

		return new Response(JSON.stringify(responseObject), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
