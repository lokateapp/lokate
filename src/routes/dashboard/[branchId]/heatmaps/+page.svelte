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

	let width = data.floorplan?.width ? data.floorplan.width * SCALE : 0;
	let height = data.floorplan?.height ? data.floorplan.height * SCALE : 0;
</script>

<div style="width: {width}px; height: {height}px;">
	<div class="ml-10 mt-10">
		<div class="flex justify-end">
			<DatePicker bind:value={currentDate} onClick={() => {}} />
		</div>

		<Heatmap {heatmapMatrix} imageSrc={imageSrc || ''} imageWidth={width} imageHeight={height} />
	</div>
</div>
