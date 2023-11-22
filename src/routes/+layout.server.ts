// import { auth } from '$lib/server/lucia';
// import { fail, redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const authData = await locals.auth.validate();
	return {user : authData?.user};
};

// export const actions: Actions = {
// 	logout: async ({ locals }) => {
		// const session = await locals.auth.validate();
		// if (!session) return fail(401);
		// await auth.invalidateSession(session.sessionId); // invalidate session
		// locals.auth.setSession(null); // remove cookie
		// throw redirect(302, '/login'); // redirect to login page
// 	}
// };
