<script lang="ts">
	import storePlan from '$lib/assets/store_plan.webp';

	import { onMount } from 'svelte';

	let Konva: any;
	let layer: any;
	let stage: any;
	let rightSideContent: boolean = false;

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

			beacon.on('pointerclick', (event: any) => {
				rightSideContent = true;
				// console.log(event);
				// event.target.fill('blue');
				// layer.draw();
			});

			beacon.on('pointerenter', (event: any) => {
				// scale up
				event.target.scale({ x: 1.2, y: 1.2 });
				layer.draw();
			});

			beacon.on('pointerleave', (event: any) => {
				// scale down
				event.target.scale({ x: 1, y: 1 });
				layer.draw();
			});

			layer.add(beacon);
			layer.draw();

			beacons.push({ x: pos.x, y: pos.y });
		}
	}

	function removeBeacon(event: any) {
		event.currentTarget.destroy();
	}
</script>

<div class="grid gap-4 grid-cols-2">
	<div class="relative max-w-max" id="parent">
		<img src={storePlan} width="600" alt="Store plan" />
		<div id="canvas" class="absolute top-0" oncontextmenu="return false" />
	</div>
	<div
		class="card w-full bg-base-100 shadow-xl"
		style={rightSideContent ? 'display: block' : 'display: none'}
	>
		<div class="card-body">
			<h2 class="card-title">
				<button
					class="btn btn-ghost btn-circle avatar"
					on:click={() => {
						rightSideContent = false;
					}}
				>
					<i class="fa-solid fa-lg fa-xmark" />
				</button>
				Beacon
			</h2>
			<p>Beacon ID: 123456</p>
			<p>Beacon UUID: 123456</p>
			<p>Beacon Major: 123456</p>
			<p>Beacon Minor: 123456</p>
			<p>Beacon RSSI: 123456</p>
			<p>Beacon TX: 123456</p>
			<p>Beacon Battery: 123456</p>
			<p>Beacon Temperature: 123456</p>
			<p>Beacon Last Seen: 123456</p>
			<p>Beacon Last Updated: 123456</p>
			<p>Beacon Created: 123456</p>
			<p>Beacon Updated: 123456</p>
			<p>Beacon Deleted: 123456</p>
			<p>Beacon Status: 123456</p>
			<p>Beacon Name: 123456</p>
			<p>Beacon Description: 123456</p>
			<p>Beacon Tags: 123456</p>
			<p>Beacon Location: 123456</p>
			<p>Beacon Location Name: 123456</p>
			<p>Beacon Location Description: 123456</p>
			<p>Beacon Location Tags: 123456</p>
		</div>
		<!-- <figure class="px-10 pt-10">
			<img
				src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
				alt="Shoes"
				class="rounded-xl"
			/>
		</figure> -->
		<div class="card-body">
			<h2 class="card-title">Campaigns</h2>
			<p>Beacon ID: 123456</p>
			<div class="card-actions">
				<button class="btn btn-primary">Edit</button>
			</div>
		</div>
	</div>
</div>

<style>
</style>
