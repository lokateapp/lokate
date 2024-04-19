import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { RequestHandler } from './$types';
import { campaigns } from '$lib/schema';

export const POST: RequestHandler = async ({ request }) => {
	const { id, status } = await request.json();
	// console.log('id: ', id, ' status: ', status);
	await db.update(campaigns).set({ status: status }).where(eq(campaigns.id, id));
	return json('');
};
