import { auth } from '$lib/server/lucia';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// we can pass `event` because we used the SvelteKit middleware
	event.locals.auth = auth.handleRequest(event);

	const session = await event.locals.auth.validate();
	if (event.url.pathname.startsWith('/dashboard')) {
		console.log('session: ', session);

		if (!session) {
			throw redirect(302, '/');
		}
	} else if (event.url.pathname.startsWith('/buildZero')) {
	} else {
		if (session) {
			throw redirect(302, '/dashboard');
		}
	}

	return await resolve(event);
};
