import type { RequestHandler } from './$types';
import { campaigns, productGroups, productGroupsToCampaigns } from '$lib/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

interface CategoryProbability {
	category: string;
	probability: number;
}

const PURCHASE_ANALYTICS_URL = 'http://localhost:5000/probabilityToBuy';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const customerId = url.searchParams.get('customerId');

		const response = await fetch(`${PURCHASE_ANALYTICS_URL}/${customerId}`);
		const categoriesProbabilities: CategoryProbability[] = await response.json();

		// select top 4 category
		const topCategories = categoriesProbabilities
			.sort((a, b) => b.probability - a.probability)
			.slice(0, 4);

		const topCampaigns = new Set();
		for (const { category } of topCategories) {
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
						.where(eq(productGroups.groupName, category))
						.limit(1)
				)[0].campaigns.name
			);
		}

		const responseObject = {
			affinedCampaigns: Array.from(topCampaigns),
			campaignVisitOrders: []
		};

		return new Response(JSON.stringify(responseObject), { status: 200 });
	} catch (error) {
		// Handle errors appropriately
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
