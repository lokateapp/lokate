import type { RequestHandler } from './$types';
import {
	beacons,
	campaigns,
	campaignsToBeacons,
	customers,
	productGroups,
	productGroupsToCampaigns
} from '$lib/schema';
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
	console.log('top categories: ', topCategories);

	const topCampaigns = new Set();
	for (const category of topCategories) {
		const campaign = await db
			.selectDistinct()
			.from(campaigns)
			.innerJoin(productGroupsToCampaigns, eq(campaigns.id, productGroupsToCampaigns.campaignId))
			.innerJoin(productGroups, eq(productGroups.id, productGroupsToCampaigns.productGroupId))
			.where(eq(productGroups.groupName, category));

		if (campaign.length !== 0) {
			for (let c of campaign) {
				topCampaigns.add(c.campaigns.name);
			}
		}
	}

	return Array.from(topCampaigns);
}

async function handleVisitAnalytics(customerId: string) {
	const response = await fetch(`${VISIT_ANALYTICS_URL}/${customerId}`);

	if (!response.ok) {
		throw new Error(`ML Backend (visit analytics) error: ${await response.text()}`);
	}

	const nextBeaconName: string = await response.json();
	const nextCampaign = await db
		.selectDistinct()
		.from(beacons)
		.innerJoin(campaignsToBeacons, eq(beacons.id, campaignsToBeacons.beaconId))
		.innerJoin(campaigns, eq(campaignsToBeacons.campaignId, campaigns.id))
		.where(eq(beacons.name, nextBeaconName))
		.limit(1);

	if (nextCampaign.length !== 0) {
		return nextCampaign[0].campaigns.name;
	}

	return '';
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
			throw new Error(`Unknown customer: ${customerName}`);
		}

		const customerId = customer[0].id;

		const topCampaigns = await handlePurchaseAnalytics(customerId);
		const nextCampaign = await handleVisitAnalytics(customerId);

		const responseObject = {
			affinedCampaigns: topCampaigns,
			nextCampaign
		};

		console.log(responseObject);

		return new Response(JSON.stringify(responseObject), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
