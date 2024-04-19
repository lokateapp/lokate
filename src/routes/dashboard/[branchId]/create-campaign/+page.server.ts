import { db } from '$lib/server/db';
import { campaigns } from '$lib/schema';

export const actions = {
	createCampaign: async ({ locals, request, params }) => {
		const session = await locals.auth.validate();
		if (session) {
			const data = await request.formData();
			const campaignName = data.get('name') as string;

			const campaign = {
				branchId: params.branchId,
				name: campaignName,
				id: crypto.randomUUID()
			};
			await db.insert(campaigns).values(campaign);

			console.log('params: ' + locals);
			console.log(locals);
		}
	}
};
