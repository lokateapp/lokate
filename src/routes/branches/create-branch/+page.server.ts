import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import { branches, floorplans } from '../../../schema';
import fs from 'fs/promises';
import path from 'path';

export const actions = {
	createBranch: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (session) {
			const data = await request.formData();
			const address = data.get('address') as string;
			const latitude = parseFloat(data.get('latitude') as string);
			const longitude = parseFloat(data.get('longitude') as string);
			const width = parseInt(data.get('width') as string);
			const height = parseInt(data.get('height') as string);

			const branch = {
				id: crypto.randomUUID(),
				userId: session.user.userId,
				address: address,
				latitude: latitude,
				longitude: longitude
			};

			// Handle file upload
			const file = data.get('floorplan') as File;
			const fileName = `${Date.now()}_${file.name}`;
			const filePath = path.join('src', 'lib', 'assets', 'store_plans', fileName);

			const floorplan = {
				id: crypto.randomUUID(),
				branchId: branch.id,
				imgPath: `/${filePath}`,
				width: width,
				height: height
			};

			try {
				await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

				await db.insert(branches).values(branch);

				await db.insert(floorplans).values(floorplan);

				console.log('Branch and floorplan added successfully');
			} catch (error) {
				console.error('Error uploading floorplan:', error);
			}

			throw redirect(302, '/branches');
		}
	}
};
