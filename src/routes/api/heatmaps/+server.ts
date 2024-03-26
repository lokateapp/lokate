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
	for (let i = 0; i < floorplanImgHeight; i++) {
		heatmap[i] = new Array(floorplanImgWidth).fill(0);
	}

	console.log(heatmap.length, heatmap[0].length);

	filteredEvents.forEach((event) => {
		for (
			let y = Math.max(0, event.location_y - radius);
			y <= Math.min(floorplanImgHeight - 1, event.location_y + radius);
			y++
		) {
			for (
				let x = Math.max(0, event.location_x - radius);
				x <= Math.min(floorplanImgWidth - 1, event.location_x + radius);
				x++
			) {
				const distance = Math.sqrt((x - event.location_x) ** 2 + (y - event.location_y) ** 2);
				if (distance <= radius) {
					// console.log(y, x);
					heatmap[y][x]++;
				}
			}
		}
	});

	// Scale the heatmap matrix
	const maxValue = getMaxValue(heatmap);
	const scaledHeatmap = heatmap.map((row) => row.map((value) => value / maxValue));

	return json(scaledHeatmap);
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

function getMaxValue(matrix: number[][]): number {
	let max = 0;
	matrix.forEach((row) => {
		row.forEach((value) => {
			if (value > max) {
				max = value;
			}
		});
	});
	return max;
}
