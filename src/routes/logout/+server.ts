import type { RequestHandler } from './$types';
import { auth } from '$lib/server/lucia';
import { fail, redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) throw redirect(302, '/');
	await auth.invalidateSession(session.sessionId); // invalidate session
	locals.auth.setSession(null); // remove cookie
	throw redirect(302, '/'); // redirect to main page
};
