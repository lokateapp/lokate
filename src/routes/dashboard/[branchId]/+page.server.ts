import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { campaigns, type SelectCampaign } from '../../../schema';

export const load: PageServerLoad = async ({ params }) => {
	const branchId = params.branchId;
	const campaigns: SelectCampaign[] = await getCampaigns(branchId);

	return { branchId, campaigns };
};

async function getCampaigns(branchId: string): Promise<SelectCampaign[]> {
	return await db.select().from(campaigns).where(eq(campaigns.branchId, branchId));
}
