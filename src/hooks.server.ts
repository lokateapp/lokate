import { auth } from '$lib/server/lucia';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// we can pass `event` because we used the SvelteKit middleware
	event.locals.auth = auth.handleRequest(event);

	const session = await event.locals.auth.validate();
	if (event.url.pathname.startsWith('/branches')) {
		console.log('session: ', session);

		if (!session) {
			throw redirect(302, '/');
		}
	} else if (
		event.url.pathname.startsWith('/buildZero') ||
		event.url.pathname.startsWith('/helper') ||
		event.url.pathname.startsWith('/api') ||
		event.url.pathname.startsWith('/dashboard')
	) {
	} else {
		if (session) {
			throw redirect(302, '/branches');
		}
	}

	return await resolve(event);
};
