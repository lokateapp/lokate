<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Heatmap from './Heatmap.svelte';

	import type { PageData } from './$types';
	import type { HeatmapData } from '../../../api/heatmaps/+server';
	import DatePicker from '$components/DatePicker.svelte';
	import { CalendarDate, getLocalTimeZone, isToday, today } from '@internationalized/date';

	export let data: PageData;
	const imageSrc = data.floorplan?.imgPath;

	const SCALE = 2;
	const TIME_INTERVAL = 5000;

	let currentDate = today(getLocalTimeZone());
	let intervalId: any = null;
	let heatmapMatrix: HeatmapData[] = [];

	$: {
		if (currentDate) {
			handleDateSelect();
		}
	}

	async function handleDateSelect() {
		clearInterval(intervalId);

		if (isToday(currentDate, getLocalTimeZone())) {
			intervalId = setInterval(async () => {
				await fetchHeatmapData(currentDate);
			}, TIME_INTERVAL);
		}

		await fetchHeatmapData(currentDate);
	}

	async function fetchHeatmapData(date: CalendarDate) {
		// console.log('date: ', date.toDate(getLocalTimeZone()));
		const res = await fetch(
			`/api/heatmaps?branchId=${data.branchId}&day=${date.toDate(
				getLocalTimeZone()
			)}&scale=${SCALE}`
		);
		heatmapMatrix = await res.json();
		// console.log('heatmapMatrix: ', heatmapMatrix);
	}

	onMount(async () => {
		await fetchHeatmapData(currentDate);
		intervalId = setInterval(async () => {
			await fetchHeatmapData(currentDate);
		}, TIME_INTERVAL);
	});

	onDestroy(() => {
		clearInterval(intervalId);
		heatmapMatrix = [];
	});
</script>

<div>
	<div style="position: relative; display: inline-block; transform-origin: top left;">
		<!-- <img src={imageSrc} alt="Floorplan" /> -->
		<div class="heatmap-overlay m-5" style="background-image: url({imageSrc});">
			<div class="relative flex justify-end">
				<DatePicker bind:value={currentDate} onClick={() => {}} />
			</div>

			<Heatmap
				{heatmapMatrix}
				imageWidth={data.floorplan?.width ?? 0}
				imageHeight={data.floorplan?.height ?? 0}
			/>
		</div>
	</div>
</div>

<style>
	.heatmap-overlay {
		background-size: contain;
		background-repeat: no-repeat;
	}
</style>
