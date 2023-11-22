import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { campaigns, type SelectCampaign } from '../../schema';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	const campaigns: SelectCampaign[] = await getCampaigns(session.user.userId);

	return { campaigns };
};

async function getCampaigns(userId: string): Promise<SelectCampaign[]> {
	return await db.select().from(campaigns).where(eq(campaigns.userId, userId));
}

export const actions = {
	createCampaign: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (session) {
			const data = await request.formData();
			const campaignName = data.get('name') as string;

			const campaign = {
				userId: session.user.userId,
				name: campaignName,
				id: crypto.randomUUID()
			};
			await db.insert(campaigns).values(campaign);

			console.log(locals);
		}
	}
};
