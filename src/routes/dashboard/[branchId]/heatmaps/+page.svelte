<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Heatmap from './Heatmap.svelte';
	import type { PageData } from './$types';

	const SCALE = 2;

	export let data: PageData;
	const imageSrc = data.floorplan?.imgPath;
	let currentDate = new Date().toISOString().split('T')[0];
	let heatmapMatrix: number[][] = [];

	async function handleDateSelect(event: any) {
		currentDate = event.target.value;
		await fetchHeatmapData(currentDate);
	}

	async function fetchHeatmapData(date: string) {
		const res = await fetch(`/api/heatmaps?branchId=${data.branchId}&day=${date}&scale=${SCALE}`);
		heatmapMatrix = await res.json();
	}

	onMount(async () => {
		await fetchHeatmapData(currentDate);
	});

	onDestroy(() => {
		heatmapMatrix = [];
	});
</script>

<div>
	<div
		style="position: relative; display: inline-block; transform-origin: top left; transform: scale({SCALE});"
	>
		<img src={imageSrc} alt="Floorplan" />

		<!-- Overlay the heatmap on top of the image -->
		<div class="heatmap-overlay">
			<Heatmap {heatmapMatrix} />
		</div>
	</div>

	<!-- Date selection section -->
	<div class="date-selection">
		<label for="date">Select Date:</label>
		<input type="date" id="date" bind:value={currentDate} on:change={handleDateSelect} />
	</div>
</div>

<style>
	.heatmap-overlay {
		position: absolute;
		top: 0;
		left: 0;
	}

	.date-selection {
		position: absolute;
		top: calc(100% - 100px);
	}
</style>
