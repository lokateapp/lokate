import { db } from '$lib/server/db';
import { branches } from '../../../schema';

export const actions = {
	createBranch: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (session) {
			const data = await request.formData();
			const address = data.get('address') as string;
			// TODO: open maps to set address and obtain latitude-longitude there
			const latitude = data.get('latitude') as number;
			const longitude = data.get('longitude') as number;

			const branch = {
				id: crypto.randomUUID(),
				userId: session.user.userId,
				address: address,
				latitude: latitude,
				longitude: longitude
			};
			await db.insert(branches).values(branch);

			console.log(locals);
		}
	}
};
