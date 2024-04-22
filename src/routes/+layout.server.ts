import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const authData = await locals.auth.validate();

	if (!authData) {
		return { user: null };
	}

	// console.log('authData', authData.user.userId);

	let userId: string = authData.user.userId;
	if (!userId) {
		return { user: null };
	}

	const branches = await db.query.branches.findMany({
		where: (branch) => eq(branch.userId, userId)
	});

	if (!branches) {
		return { user: null };
	}

	return { user: authData.user, branches: branches };
};
