import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import sharp from 'sharp';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const branchId = url.searchParams.get('branchId');
	if (!branchId) {
		return json({ error: 'BranchId is required' }, { status: 400 });
	}
	const day = url.searchParams.get('day');

	const date = new Date(day!);
	console.log('date: ', date);

	// const filteredEvents = await db.execute(
	// 	sql`select * from ${events} where ${events.branchId} = ${branchId} and DATE(${events.enterTimestamp}) = ${day}`
	// );
	const filteredEvents = await db.query.events.findMany({
		where: (event) => and(eq(event.branchId, branchId), eq(event.enterTimestamp, date))
	});

	console.log('filteredEvents: ', filteredEvents);

	const floorplan = await getFloorPlan(branchId!);
	const floorplanImgPath = floorplan?.imgPath.slice(1);
	const { floorplanImgWidth, floorplanImgHeight } = await getImageDimensions(floorplanImgPath!);

	const heatmap: number[][] = [];
	for (let i = 0; i < floorplanImgHeight; i++) {
		heatmap[i] = new Array(floorplanImgWidth).fill(0);
	}

	filteredEvents.forEach((event) => {
		const radius = Math.ceil(event.radius);
		for (
			let y = Math.max(0, event.locationY - radius);
			y <= Math.min(floorplanImgHeight - 1, event.locationY + radius);
			y++
		) {
			for (
				let x = Math.max(0, event.locationX - radius);
				x <= Math.min(floorplanImgWidth - 1, event.locationX + radius);
				x++
			) {
				const distance = Math.sqrt((x - event.locationX) ** 2 + (y - event.locationY) ** 2);
				if (distance <= radius) {
					heatmap[y][x] += event.possibleExitTimestamp.getTime() - event.enterTimestamp.getTime();
					console.log('heatmap[y][x]: ', heatmap[y][x]);
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
