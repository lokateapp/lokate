import type { PageServerLoad } from '../../../$types';

import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { campaigns, type SelectCampaign } from '../../../../../schema';

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.auth.validate();
	const campaignId = params.id;
	// console.log(session);
	// if (!session) throw redirect(302, '/login');

	let campaign = null;
	if (session) {
		const campaigns: SelectCampaign[] = await getCampaign(campaignId);
		campaign = campaigns[0];
	}

	console.log({ id: campaignId, campaign: campaign });

	return { campaign };
};

async function getCampaign(campaignId: string): Promise<SelectCampaign[]> {
	return await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
}
