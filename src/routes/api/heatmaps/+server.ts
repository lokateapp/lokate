import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { and, eq, sql } from 'drizzle-orm';
import sharp from 'sharp';

import type { RequestHandler } from './$types';

export type HeatmapData = {
	x: number;
	y: number;
	value: number;
};
export const GET: RequestHandler = async ({ url }) => {
	const branchId = url.searchParams.get('branchId');
	if (!branchId) {
		return json({ error: 'BranchId is required' }, { status: 400 });
	}
	const day = url.searchParams.get('day');

	// console.log('day: ', day);

	// const date = new Date(day!);
	// console.log('date: ', date);

	const filteredEvents = await db.query.events.findMany({
		where: (event) => and(eq(event.branchId, branchId), sql`DATE(${event.enterTimestamp}) = ${day}`)
	});

	// console.log('filteredEvents: ', filteredEvents);

	const floorplan = await getFloorPlan(branchId!);
	const floorplanImgPath = floorplan?.imgPath.slice(1);
	const { floorplanImgWidth, floorplanImgHeight } = await getImageDimensions(floorplanImgPath!);

	let heatMapData: HeatmapData[] = [];
	filteredEvents.forEach((event) => {
		const radius = Math.ceil(event.radius);
		let value = event.possibleExitTimestamp.getTime() - event.enterTimestamp.getTime();
		for (
			let y = Math.max(0, event.locationY - radius);
			y <= Math.min(floorplanImgHeight - 1, event.locationY + radius);
			y += 1
		) {
			for (
				let x = Math.max(0, event.locationX - radius);
				x <= Math.min(floorplanImgWidth - 1, event.locationX + radius);
				x += 1
			) {
				const distance = Math.sqrt((x - event.locationX) ** 2 + (y - event.locationY) ** 2);
				if (distance <= radius) {
					heatMapData.push({
						x,
						y,
						value: value / distance
					});
				}
			}
		}
	});
	// console.log('heatMapData: ', heatMapData);
	return json(heatMapData);
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
