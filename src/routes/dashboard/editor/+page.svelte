<script lang="ts">
	import storePlan from '$lib/assets/store_plan.webp';
	import yellowBeacon from '$lib/assets/yellowbeacon.png';

	import { onMount } from 'svelte';
	// import Konva from 'konva';

	let Konva: any;
	// let layer: Konva.Layer;
	// let stage: Konva.Stage;
	let layer: any;
	let stage: any;
	let rightSideContent: boolean = false;
	let rangeOpen: boolean = false;
	let range: number = 1;

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
			rangeOpen = true;
			let pos = stage.getPointerPosition();
			console.log('pos:', pos);

			// var beacon = new Konva.Circle({
			// 	x: pos.x,
			// 	y: pos.y,
			// 	radius: 15,
			// 	fill: 'red',
			// 	draggable: true
			// });

			var imageObj = new Image();
			imageObj.src = yellowBeacon;

			var beacon = new Konva.Image({
				x: pos.x,
				y: pos.y,
				image: imageObj,
				// crop: {
				// 	x: 200,
				// 	y: 100,
				// 	width: 300,
				// 	height: 300
				// },
				width: 50,
				height: 50,
				draggable: true
			});

			var circleRange = new Konva.Circle({
				x: pos.x,
				y: pos.y,
				radius: BEACON_RADIUS * 3,
				stroke: 'red',
				strokeWidth: 1,
				fill: 'red',
				opacity: 0.2
			});

			// add the shape to the layer
			beacon.on('pointerdblclick', removeBeacon);

			beacon.on('pointerclick', (event: any) => {
				rightSideContent = true;
				// console.log(event);
				// event.target.fill('blue');
				// layer.draw();
			});

			beacon.on('pointerenter', (event: any) => {
				// scale up
				event.target.scale({ x: 1.1, y: 1.1 });
				layer.draw();
			});

			beacon.on('pointerleave', (event: any) => {
				// scale down
				event.target.scale({ x: 1, y: 1 });
				layer.draw();
			});

			beacon.on('dragmove', (event: any) => {
				// console.log(event);
				circleRange.x(event.target.x());
				circleRange.y(event.target.y());
				layer.draw();
			});

			layer.add(circleRange);
			layer.add(beacon);
			layer.draw();

			beacons.push({ x: pos.x, y: pos.y });
		}
	}

	function addRangeToBeacon(beacon: any) {
		// // var circleRange = new Konva.Circle({
		// // 	x: beacon.x,
		// // 	y: beacon.y,
		// // 	radius: BEACON_RADIUS * range,
		// // 	stroke: 'red',
		// // 	strokeWidth: 1,
		// // 	fill : 'red',
		// // 	opacity: 0.2,
		// // });
		// layer.add(circleRange);
		// circleRange.moveToBottom();

		// find the beacon in the layer and its circle range
		var circleRange = layer.find('Circle').find((circle: any) => {
			return circle.x() == beacon.x && circle.y() == beacon.y;
		});

		if (!circleRange) {
			return;
		}
		// update the circle range
		circleRange.setAttrs({
			radius: BEACON_RADIUS * range
		});

		layer.draw();
	}

	function removeBeacon(event: any) {
		event.currentTarget.destroy();
	}
</script>

<div class="grid gap-4 grid-cols-2">
	<div class="relative max-w-max" id="parent">
		<img src={storePlan} width="600" alt="Store plan" />
		<div id="canvas" class="absolute top-0" oncontextmenu="return false" />
		<div
			class="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50"
			style={rangeOpen ? 'display: block' : 'display: none'}
		>
			<div class="flex justify-center items-center h-full">
				<div class="flex flex-col justify-center items-center">
					<div class="flex justify-center items-center">
						<button
							class="btn btn-ghost btn-circle avatar"
							on:click={() => {
								rangeOpen = false;
							}}
						>
							<i class="fa-solid fa-lg fa-xmark" />
						</button>
					</div>
					<div class="flex justify-center items-center">
						<div class="form-control w-full max-w-xs">
							<label class="label">
								<span class="label-text">Range</span>
							</label>
							<!-- <input
								class="input input-bordered input-primary w-full max-w-xs join-item"
								name="name"
								type="text"
								placeholder="Range"
								bind:value={range}
							/> -->
							<input type="range" min="1" max="30" class="range" step="0.5" bind:value={range} />
							<div class="flex justify-center items-center">
								<span
									class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap"
								>
									{range}m
								</span>
							</div>
						</div>
					</div>
					<div class="flex justify-center items-center">
						<button
							class="btn btn-primary"
							on:click={() => {
								addRangeToBeacon(beacons[beacons.length - 1]);
								rangeOpen = false;
							}}
						>
							Apply
						</button>
					</div>
				</div>
			</div>
		</div>
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
