<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Heatmap from './Heatmap.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const imageSrc = data.floorplan?.imgPath;
	let currentDate = new Date().toISOString().split('T')[0];
	let heatmapMatrix: number[][] = [];

	async function handleDateSelect(event: any) {
		currentDate = event.target.value;
		await fetchHeatmapData(currentDate);
	}

	async function fetchHeatmapData(date: string) {
		const res = await fetch(`/api/heatmaps?branchId=${data.branchId}&day=${date}`);
		heatmapMatrix = await res.json();
	}

	onMount(async () => {
		await fetchHeatmapData(currentDate);
	});

	onDestroy(() => {
		heatmapMatrix = [];
	});
</script>

<div class="container">
	<img src={imageSrc} alt="Floorplan" />

	<!-- Overlay the heatmap on top of the image -->
	<div class="heatmap-overlay">
		<Heatmap {heatmapMatrix} />
	</div>
</div>

<!-- Date selection section -->
<div>
	<label for="date">Select Date:</label>
	<input type="date" id="date" bind:value={currentDate} on:change={handleDateSelect} />
</div>

<style>
	.container {
		position: relative;
	}

	.heatmap-overlay {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
