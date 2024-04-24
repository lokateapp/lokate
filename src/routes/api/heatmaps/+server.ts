import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { and, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { getImageDimensions } from '$lib/get-img-dimensions';

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

	let scale = parseInt(url.searchParams.get('scale')!);

	const filteredEvents = await db.query.events.findMany({
		where: (event) => and(eq(event.branchId, branchId), sql`DATE(${event.enterTimestamp}) = ${day}`)
	});

	// console.log('filteredEvents: ', filteredEvents);

	const floorplan = await getFloorPlan(branchId!);
	const floorplanImgPath = floorplan?.imgPath;
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
						x: x * scale,
						y: y * scale,
						value: value / distance
					});
				}
			}
		}
	});

	// Min-max feature scaling
	// const min = Math.min(...heatMapData.map((data) => data.value));
	// const max = Math.max(...heatMapData.map((data) => data.value));
	// heatMapData = heatMapData.map((data) => ({
	// 	...data,
	// 	value: (data.value - min) / (max - min)
	// }));
	// console.log('heatMapData: ', heatMapData);
	return json(heatMapData);
};

async function getFloorPlan(branchId: string) {
	return await db.query.floorplans.findFirst({
		where: (floorplan, { eq }) => eq(floorplan.branchId, branchId)
	});
}
