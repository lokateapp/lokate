<script lang="js">
	// @ts-nocheck
	import { onMount } from 'svelte';

	import Heatmap from 'visual-heatmap';
	export let heatmapMatrix, imageWidth, imageHeight;

	// function generateData(count, width, height) {
	// 	var data = [];
	// 	for (let i = 0; i < count; i++) {
	// 		let val = Math.random() * 10;
	// 		data.push({
	// 			x: random(0, width),
	// 			y: random(0, height),
	// 			// velX: random(-0.5, 0.25),
	// 			// velY: random(-0.5, 0.25),
	// 			value: val,
	// 			label: 'label_' + i
	// 		});
	// 	}
	// 	return data;
	// }

	// function random(min, max) {
	// 	var num = Math.random() * (max - min) + min;
	// 	return num;
	// }

	let instance;
	onMount(() => {
		instance = Heatmap('#heatmap', {
			size: 20, //Radius of the data point, in pixels. Default: 20
			// max: 100, // if not set, will be derived from data
			// min: 0, // if not set, will be derived from data
			intensity: 0.2,
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
		// var data = generateData(1000, 500, 500);
		// instance.renderData(data);
		instance.renderData(heatmapMatrix);
	});
	$: if (instance) {
		instance.renderData(heatmapMatrix);
	}
</script>

<div class="heatmap" id="heatmap" style="width: {imageHeight}px; height: {imageWidth}px" />
