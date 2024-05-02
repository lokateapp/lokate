import type { RequestHandler } from './$types';
import { campaigns, customers, productGroups, productGroupsToCampaigns } from '$lib/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

type CategoryToProbability = [string, number];

const PURCHASE_ANALYTICS_URL = 'http://localhost:8000/purchase-analytics';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const customerId = url.searchParams.get('customerId');
		const customer = await db
			.select()
			.from(customers)
			.where(eq(customers.customerId, customerId!))
			.limit(1);

		if (customer === undefined) {
			throw new Error('Unknown customer');
		}

		const response = await fetch(`${PURCHASE_ANALYTICS_URL}/${customer[0].id}`);

		if (!response.ok) {
			throw new Error(`ML Backend error: ${await response.text()}`);
		}

		const categoriesProbabilities: CategoryToProbability[] = await response.json();

		// select top 4 category
		const topCategories = categoriesProbabilities.sort((a, b) => b[1] - a[1]).slice(0, 4);

		const topCampaigns = new Set();
		for (const categoryToProbability of topCategories) {
			topCampaigns.add(
				(
					await db
						.selectDistinct()
						.from(campaigns)
						.innerJoin(
							productGroupsToCampaigns,
							eq(campaigns.id, productGroupsToCampaigns.campaignId)
						)
						.innerJoin(productGroups, eq(productGroups.id, productGroupsToCampaigns.productGroupId))
						.where(eq(productGroups.groupName, categoryToProbability[0]))
						.limit(1)
				)[0].campaigns.name
			);
		}

		const responseObject = {
			affinedCampaigns: Array.from(topCampaigns),
			campaignVisitOrders: []
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

// {
//     "affinedCampaigns": ["", "", ""],   // only for market app, based on purchase analytics
//     "campaignVisitOrders": [            // for all apps
//         ["", ""],
//         ["", ""],
//         ["", ""],
//     ]
// }
