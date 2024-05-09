import type { RequestHandler } from './$types';
import { campaigns, customers, productGroups, productGroupsToCampaigns } from '$lib/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

const PURCHASE_ANALYTICS_URL = 'http://localhost:8000/purchase-analytics';
const VISIT_ANALYTICS_URL = 'http://localhost:8000/visit-analytics';

async function handlePurchaseAnalytics(customerId: string) {
	const response = await fetch(`${PURCHASE_ANALYTICS_URL}/${customerId}`);

	if (!response.ok) {
		throw new Error(`ML Backend (purchase analytics) error: ${await response.text()}`);
	}

	const topCategories: string[] = await response.json();

	const topCampaigns = new Set();
	for (const category of topCategories) {
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

	return Array.from(topCampaigns);
}

async function handleVisitAnalytics(customerId: string) {
	const response = await fetch(`${VISIT_ANALYTICS_URL}/${customerId}`);

	if (!response.ok) {
		throw new Error(`ML Backend (visit analytics) error: ${await response.text()}`);
	}

	const nextCampaign: string = await response.json();
	return nextCampaign;
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const customerName = url.searchParams.get('customerId');
		const customer = await db
			.select()
			.from(customers)
			.where(eq(customers.customerId, customerName!))
			.limit(1);

		if (customer.length === 0) {
			throw new Error('Unknown customer');
		}

		const customerId = customer[0].id;

		const topCampaigns = await handlePurchaseAnalytics(customerId);
		const nextCampaign = await handleVisitAnalytics(customerId);

		const responseObject = {
			affinedCampaigns: topCampaigns,
			nextCampaign
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
