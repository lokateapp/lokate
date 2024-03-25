import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import sharp from 'sharp';

import type { RequestHandler } from './$types';
import { events } from '../../../schema';

export const GET: RequestHandler = async ({ url }) => {
	const branchId = url.searchParams.get('branchId');
	const day = url.searchParams.get('day');

	const filteredEvents = await db.execute(
		sql`select * from ${events} where ${events.branchId} = ${branchId} and DATE(${events.enterTimestamp}) = ${day}`
	);

	const radius = 10; // TODO: get radius from events

	const floorplan = await getFloorPlan(branchId!);
	const floorplanImgPath = floorplan?.imgPath.slice(1);
	const { floorplanImgWidth, floorplanImgHeight } = await getImageDimensions(floorplanImgPath!);

	const heatmap: number[][] = [];
	for (let i = 0; i < floorplanImgWidth; i++) {
		heatmap[i] = new Array(floorplanImgHeight).fill(0);
	}

	filteredEvents.forEach((event) => {
		for (let dx = -radius; dx <= radius; dx++) {
			for (let dy = -radius; dy <= radius; dy++) {
				const x = event.location_x + dx;
				const y = event.location_y + dy;

				if (x >= 0 && x < floorplanImgWidth && y >= 0 && y < floorplanImgHeight) {
					heatmap[x][y]++;
				}
			}
		}
	});

	return json(heatmap);
};

async function getFloorPlan(branchId: string) {
	return await db.query.floorplans.findFirst({
		where: (floorplan, { eq }) => eq(floorplan.branchId, branchId)
	});
}

async function getImageDimensions(imgPath: string) {
	const metadata = await sharp(imgPath).metadata();
	return {
		floorplanImgWidth: metadata.width!,
		floorplanImgHeight: metadata.height!
	};
}
