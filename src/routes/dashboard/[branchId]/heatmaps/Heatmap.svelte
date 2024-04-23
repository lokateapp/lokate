<script lang="js">
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Heatmap from 'visual-heatmap';
	export let heatmapMatrix, imageWidth, imageHeight, imageSrc;

	let instance;
	onMount(() => {
		instance = Heatmap('#heatmap', {
			size: 15, //Radius of the data point, in pixels. Default: 20
			// max: 100, // if not set, will be derived from data
			// min: 0, // if not set, will be derived from data
			backgroundImage: {
				url: imageSrc,
				width: imageWidth,
				height: imageHeight,
				x: 0,
				y: 0
			},
			intensity: 0.5,
			zoom: 1.0,
			gradient: [
				{
					color: [0, 0, 255, 1.0],
					offset: 0
				},
				{
					color: [0, 0, 255, 1.0],
					offset: 0.2
				},
				{
					color: [0, 255, 0, 1.0],
					offset: 0.45
				},
				{
					color: [255, 255, 0, 1.0],
					offset: 0.85
				},
				{
					color: [255, 0, 0, 1.0],
					offset: 1.0
				}
			]
		});
		instance.renderData(heatmapMatrix);
	});
	$: if (instance) {
		instance.renderData(heatmapMatrix);
	}
</script>

<div class="absolute heatmap" id="heatmap" style="width: {imageWidth}px; height: {imageHeight}px" />
