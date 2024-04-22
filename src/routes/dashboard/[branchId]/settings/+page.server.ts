import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/lucia';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	changePassword: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (session) {
			const data = await request.formData();

			console.log('data', data);

			if (data.get('password') !== data.get('confirm-password')) {
				return {
					status: 400,
					body: {
						message: 'Passwords do not match'
					}
				};
			}

			const userId = session.user.userId;

			// console.log('session', session);

			// const user = await auth.getUser(userId);
			// console.log('user : ', user);
			// try {
			// 	const key = await auth.useKey(
			// 		'username',
			// 		user.username,
			// 		data.get('old-password') as string
			// 	);
			// 	console.log('key', key);
			// } catch (e) {
			// 	return {
			// 		status: 400,
			// 		body: {
			// 			message: 'Incorrect old password'
			// 		}
			// 	};
			// }

			// const newPassword = data.get('password') as string;

			// if (newPassword) {
			// 	// await auth.updateKeyPassword('username', userId, newPassword);
			// }

			// try {
			// 	await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

			// 	await db.insert(branches).values(branch);

			// 	await db.insert(floorplans).values(floorplan);

			// 	console.log('Branch and floorplan added successfully');
			// } catch (error) {
			// 	console.error('Error uploading floorplan:', error);
			// }

			return {
				status: 200,
				body: {
					message: 'Password changed successfully'
				}
			};
		}
	}
};
