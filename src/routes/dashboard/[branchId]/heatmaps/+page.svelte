<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Heatmap from './Heatmap.svelte';
	import { DatePicker } from '@svelte-plugins/datepicker';

	import type { PageData } from './$types';
	import type { HeatmapData } from '../../../api/heatmaps/+server';
	import dayjs from 'dayjs';

	export let data: PageData;
	const imageSrc = data.floorplan?.imgPath;

	const SCALE = 2;
	const TIME_INTERVAL = 5000;
	let isOpen = false;
	const toggleDatePicker = () => (isOpen = !isOpen);

	let currentDate = new Date();
	let dateFormat = 'DD/MM/YYYY';

	const formatDate = (date: Date) => {
		// return dateString && dateString.toISOString().split('T')[0];
		return dayjs(new Date(date)).format(dateFormat);
	};

	let formattedStartDate = formatDate(currentDate);
	$: formattedStartDate = formatDate(currentDate);

	let heatmapMatrix: HeatmapData[] = [];

	let intervalId: any = null;

	async function handleDateSelect(event: any) {
		clearInterval(intervalId);

		// If today's date is selected, start the interval
		if (new Date(currentDate).toDateString() === new Date().toDateString()) {
			intervalId = setInterval(async () => {
				await fetchHeatmapData(currentDate);
			}, TIME_INTERVAL);
		}

		await fetchHeatmapData(currentDate);
	}

	async function fetchHeatmapData(date: Date) {
		let formattedDate = new Date(date).toISOString().split('T')[0];
		const res = await fetch(
			`/api/heatmaps?branchId=${data.branchId}&day=${formattedDate}&scale=${SCALE}`
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

		<!-- Overlay the heatmap on top of the image -->
		<div class="heatmap-overlay m-5" style="background-image: url({imageSrc});">
			<Heatmap
				{heatmapMatrix}
				imageWidth={data.floorplan?.width ?? 0}
				imageHeight={data.floorplan?.height ?? 0}
			/>
		</div>
	</div>

	<!-- Date selection section -->
	<!-- <div class="date-selection">
		<DatePicker bind:isOpen bind:startDate={currentDate}>
			<label for="date">Select Date:</label>
			<input
				type="text"
				placeholder="Select date"
				bind:value={formattedStartDate}
				on:click={toggleDatePicker}
				on:change={handleDateSelect}
			/>
		</DatePicker>
	</div> -->
	<div class="date-selection">
		<label for="date">Select Date:</label>
		<input type="date" id="date" bind:value={currentDate} on:change={handleDateSelect} />
	</div>
</div>

<style>
	.heatmap-overlay {
		background-size: contain;
		background-repeat: no-repeat;
	}

	.date-selection {
		position: absolute;
		top: calc(100px);
	}
</style>
