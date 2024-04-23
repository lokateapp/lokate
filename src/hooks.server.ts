import { auth } from '$lib/server/lucia';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event);

	const session = await event.locals.auth.validate();
	if (event.url.pathname.startsWith('/branches') || event.url.pathname.startsWith('/dashboard')) {
		// console.log('session: ', session);

		if (!session) {
			throw redirect(302, '/');
		}
	} else if (
		event.url.pathname.startsWith('/buildZero') ||
		event.url.pathname.startsWith('/deleteAll') ||
		event.url.pathname.startsWith('/helper') ||
		event.url.pathname.startsWith('/api')
	) {
	} else {
		if (session) {
			throw redirect(302, '/branches');
		}
	}

	return await resolve(event);
};
