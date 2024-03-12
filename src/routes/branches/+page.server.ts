import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { branches, type SelectBranch } from '../../schema';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	const branches: SelectBranch[] = await getBranches(session.user.userId);

	return { branches };
};

async function getBranches(userId: string): Promise<SelectBranch[]> {
	return await db.select().from(branches).where(eq(branches.userId, userId));
}
