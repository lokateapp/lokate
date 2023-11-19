import type { PageServerLoad } from '../../$types';

import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { campaigns, type SelectCampaign } from '../../../schema';

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.auth.validate();
	console.log(session);
	if (!session) throw redirect(302, '/login');

	const campaigns: SelectCampaign[] = await getCampaign(params.id, session.user.userId);
	const campaign = campaigns[0];

	console.log({ id: params.id });
	console.log({ asdasd: campaign });

	return { campaign };
};

async function getCampaign(campaignId: string, userId: string): Promise<SelectCampaign[]> {
	return await db
		.select()
		.from(campaigns)
		.where(and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId)));
}
