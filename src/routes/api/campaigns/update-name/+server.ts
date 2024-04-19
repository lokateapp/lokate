import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { RequestHandler } from './$types';
import { campaigns } from '$lib/schema';

export const POST: RequestHandler = async ({ request }) => {
	const { id, name } = await request.json();
	// console.log('Update name id: ', id, ' name: ', name);
	await db.update(campaigns).set({ name: name }).where(eq(campaigns.id, id));
	return json('');
};
