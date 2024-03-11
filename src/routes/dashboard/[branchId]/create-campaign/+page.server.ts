import { db } from '$lib/server/db';
import { campaigns } from '../../../../schema';

export const actions = {
	createCampaign: async ({ locals, request, url }) => {
		const session = await locals.auth.validate();
		if (session) {
			const data = await request.formData();
			const campaignName = data.get('name') as string;

			const campaign = {
				branchId: url.pathname.split('/')[2], // TODO: terrible
				name: campaignName,
				id: crypto.randomUUID()
			};
			await db.insert(campaigns).values(campaign);

			console.log('params: ' + locals);
			console.log(locals);
		}
	}
};
