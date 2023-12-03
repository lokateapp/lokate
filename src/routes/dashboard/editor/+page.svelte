<script lang="ts">
	import storePlan from '$lib/assets/store_plan.webp';
	// import yellowBeacon from '$lib/assets/yellowbeacon.png';
	import BeaconSvg from '$lib/assets/beacon.svg';
	import { onMount } from 'svelte';

	import type KonvaType from 'konva';

	let Konva: typeof KonvaType;
	let layer: KonvaType.Layer;
	let stage: KonvaType.Stage;
	let backgroundImage: KonvaType.Image;
	// let layer: any;
	// let stage: any;
	let rightSideContent: boolean = false;
	let rangeOpen: boolean = false;
	let range: number = 1;

	onMount(async () => {
		Konva = (await import('konva')).default;
		// const parent: HTMLCanvasElement = document.getElementById('parent')! as HTMLCanvasElement;
		// console.log('parent:', parent.clientWidth, parent.clientHeight);
		const clientHeight = document.documentElement.clientHeight;
		const clientWidth = document.documentElement.clientWidth;
		var konvaStage = new Konva.Stage({
			container: 'canvas', // id of container <div>
			width: 400,
			height: 800
			// height: 400,
			// width: parent.clientWidth,
			// height: parent.clientHeight
		});
		stage = konvaStage;

		// then create layer
		var konvaLayer = new Konva.Layer();

		// add the layer to the stage
		stage.add(konvaLayer);

		// draw the image
		konvaLayer.draw();
		layer = konvaLayer;

		// add stage a background image
		var imageObj = new Image();
		imageObj.src = storePlan;
		imageObj.onload = function () {
			// change background color to red
			backgroundImage = new Konva.Image({
				x: 0,
				y: 0,
				image: imageObj,
				width: stage.width(),
				height: stage.height()
			});

			// add the shape to the layer
			konvaLayer.add(backgroundImage);
			backgroundImage.moveToBottom();
			konvaLayer.draw();
		};

		stage.on('pointerdown', maybeAddBeacon);

		// var scaleBy = 1.01;
		// stage.on('wheel', (e : any) => {
		// 	// stop default scrolling
		// 	e.evt.preventDefault();
		// 	var oldScale = stage.scaleX();
		// 	var pointer = stage.getPointerPosition();
		// 	if (!pointer) {
		// 		return;
		// 	}
		// 	var mousePointTo = {
		// 	x: (pointer.x - stage.x()) / oldScale,
		// 	y: (pointer.y - stage.y()) / oldScale,
		// 	};
		// 	// how to scale? Zoom in? Or zoom out?
		// 	let direction = e.evt.deltaY > 0 ? 1 : -1;
		// 	// when we zoom on trackpad, e.evt.ctrlKey is true
		// 	// in that case lets revert direction
		// 	if (e.evt.ctrlKey) {
		// 	direction = -direction;
		// 	}
		// 	var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
		// 	stage.scale({ x: newScale, y: newScale });
		// 	var newPos = {
		// 	x: pointer.x - mousePointTo.x * newScale,
		// 	y: pointer.y - mousePointTo.y * newScale,
		// 	};
		// 	stage.position(newPos);
		// });
	});

	const BEACON_RADIUS = 15;
	const BEACON_AREA_RADIUS = 100;

	const BEACON_RANGE = 10;

	// const IMAGE_W = 20;
	// const IMAGE_H = 25;
	type Beacon = {
		x: number;
		y: number;
	};

	let beacons: Beacon[] = [];

	function maybeAddBeacon(event: any) {
		console.log('event:', event);
		if (event.target == backgroundImage) {
			rangeOpen = true;
			let pos = stage.getPointerPosition() || { x: 0, y: 0 };
			console.log('pos:', pos);

			// var beacon = new Konva.Circle({
			// 	x: pos.x,
			// 	y: pos.y,
			// 	radius: 15,
			// 	fill: 'red',
			// 	draggable: true
			// });

			var imageObj = new Image();
			imageObj.src = BeaconSvg;
			imageObj.onload = function () {
				// change background color to red
				const IMAGE_W = imageObj.width / 7;
				const IMAGE_H = imageObj.height / 7;
				var beacon = new Konva.Image({
					x: pos.x,
					y: pos.y,
					offsetX: IMAGE_W,
					offsetY: IMAGE_H,
					image: imageObj,
					// crop: {
					// 	x: 200,
					// 	y: 100,
					// 	width: 300,
					// 	height: 300
					// },
					width: IMAGE_W * 2,
					height: IMAGE_H * 2,
					draggable: true,
					// not draggable if outside of the area
					dragBoundFunc: function (pos: any) {
						var x = pos.x;
						var y = pos.y;
						const DELTA = 30; //BEACON_AREA_RADIUS
						if (x < DELTA) {
							x = DELTA;
						}
						if (x > stage.width() - DELTA) {
							x = stage.width() - DELTA;
						}
						if (y < DELTA) {
							y = DELTA;
						}
						if (y > stage.height() - DELTA) {
							y = stage.height() - DELTA;
						}
						return {
							x: x,
							y: y
						};
					}
				});

				var padding = 20;
				var w = imageObj.width;
				var h = imageObj.height;

				// get the aperture we need to fit by taking padding off the stage size.

				var targetW = stage.getSize().width - 2 * padding;
				var targetH = stage.getSize().height - 2 * padding;

				// compute the ratios of image dimensions to aperture dimensions
				var widthFit = targetW / w;
				var heightFit = targetH / h;

				// compute a scale for best fit and apply it
				var scale = widthFit > heightFit ? heightFit : widthFit;

				var new_w = w * scale;
				var new_h = h * scale;

				console.log('new_w:', new_w, 'new_h:', new_h, ' old_w:', w, ' old_h:', h, ' scale:', scale);

				// beacon.size({
				// 	width: new_w,
				// 	height: new_h
				// });

				var circleRange = new Konva.Circle({
					x: pos.x,
					y: pos.y,
					radius: BEACON_RANGE * 1,
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
			};
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
			radius: BEACON_RANGE * range
		});

		layer.draw();
	}

	function removeBeacon(event: any) {
		// find circle range

		var circleRange = layer.find('Circle').find((circle: any) => {
			return circle.x() == event.target.x() && circle.y() == event.target.y();
		});

		if (!circleRange) {
			event.currentTarget.destroy();
			return;
		}

		circleRange.destroy();
		event.currentTarget.destroy();
		layer.draw();
	}
</script>

<!-- grid gap-4 grid-cols-2 
	flex flex-row items-center justify-center bg-orange-900 p-10
-->
<div class="grid gap-4 grid-cols-2">
	<!-- <div class="bg-slate-200 w-10 h-10"></div> -->
	<div class="relative max-w-max " id="parent">
		<!-- <img src={storePlan} width="600" alt="Store plan" /> -->
		<div id="canvas" class="absolute top-0" oncontextmenu="return false" />
		<!-- <Stage config={{ width: window.innerWidth, height: window.innerHeight }}>
			<Layer >
				{#each beacons as beacon}
					<Circle config={{ x: beacon.x, y: beacon.y, radius: BEACON_RADIUS, fill: 'red' }} />
				{/each}
				
			</Layer>
		  </Stage> -->		
	</div>
	<div
			class="relative top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50"
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
							<input
								type="range"
								min="1"
								max="30"
								class="range range-primary range-sm btn-wide"
								step="0.5"
								bind:value={range}
							/>
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
<dialog id="my_modal_1" class="modal {rightSideContent ? 'modal-open' : ''}">
	<div class="modal-box absolute top-0 h-full max-h-full right-0 w-1/2">
		<div class="w-full bg-base-100">
			<button
				class="btn btn-ghost btn-circle avatar"
				on:click={() => {
					rightSideContent = false;
				}}
			>
				<i class="fa-solid fa-lg fa-xmark" />
			</button>
			<h2 class="">Beacon</h2>
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
</dialog>

<style>
</style>
