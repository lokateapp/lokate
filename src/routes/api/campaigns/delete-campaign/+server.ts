import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { RequestHandler } from './$types';
import { campaigns } from '$lib/schema';

export const POST: RequestHandler = async ({ request }) => {
	const { id } = await request.json();
	// console.log('Delete campaign with id: ', id);
	await db.delete(campaigns).where(eq(campaigns.id, id));
	return json('');
};
