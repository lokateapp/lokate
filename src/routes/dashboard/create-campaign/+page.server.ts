import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { campaigns, type SelectCampaign } from '../../../schema';

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
