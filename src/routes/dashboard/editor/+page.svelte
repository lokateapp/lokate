<script lang="ts">
	import storePlan from '$lib/assets/store_plan.webp';

	import { onMount } from 'svelte';

	let Konva: any;
	let layer: any;
	let stage: any;
	onMount(async () => {
		Konva = (await import('konva')).default;
		const parent: HTMLCanvasElement = document.getElementById('parent')! as HTMLCanvasElement;

		var konvaStage = new Konva.Stage({
			container: 'canvas', // id of container <div>
			width: parent.clientWidth,
			height: parent.clientHeight
		});
		stage = konvaStage;

		// then create layer
		var konvaLayer = new Konva.Layer();

		// add the layer to the stage
		stage.add(konvaLayer);

		// draw the image
		konvaLayer.draw();
		layer = konvaLayer;

		stage.on('pointerdown', maybeAddBeacon);
	});

	const BEACON_RADIUS = 15;
	const BEACON_AREA_RADIUS = 100;
	type Beacon = {
		x: number;
		y: number;
	};

	let beacons: Beacon[] = [];

	function maybeAddBeacon(event: any) {
		if (event.target == stage) {
			let pos = stage.getPointerPosition();
			console.log(pos);

			var beacon = new Konva.Circle({
				x: pos.x,
				y: pos.y,
				radius: 15,
				fill: 'red',
				draggable: true
			});

			beacon.on('pointerdblclick', removeBeacon);

			layer.add(beacon);
			layer.draw();

			beacons.push({ x: pos.x, y: pos.y });
		}
	}

	function removeBeacon(event: any) {
		event.currentTarget.destroy();
	}
</script>

<div class="relative max-w-max" id="parent">
	<img src={storePlan} width="600" />
	<div id="canvas" class="absolute top-0" oncontextmenu="return false" />
</div>

<style>
</style>
