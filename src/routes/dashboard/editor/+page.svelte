<script lang="ts">
	import storePlan from '$lib/assets/store_plan.webp';

	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement | null = null;
	let context: CanvasRenderingContext2D | null = null;
	onMount(() => {
		const parent: HTMLCanvasElement = document.getElementById('parent')! as HTMLCanvasElement;
		const canvasElement: HTMLCanvasElement = document.getElementById(
			'canvas'
		)! as HTMLCanvasElement;

		console.log(parent.clientHeight);

		canvasElement.setAttribute('width', parent.clientWidth.toString());
		canvasElement.setAttribute('height', parent.clientHeight.toString());

		console.log('asdads');

		const ctx = canvasElement.getContext('2d')!;
		context = ctx;
		canvas = canvasElement;

		ctx.fillStyle = 'green';
		ctx.fillRect(10, 10, 150, 100);
	});

	const BEACON_RADIUS = 15;
	const BEACON_AREA_RADIUS = 100;
	type Beacon = {
		x: number;
		y: number;
	};

	let beacons: Beacon[] = [];

	function handleClick(event: any) {
		console.log(event);

		let { x, y } = getMousePosition(canvas!, event);

		addBeacon(context!, x, y);
	}

	function getMousePosition(canvas: HTMLCanvasElement, evt: any) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}

	function findBeacon(x: number, y: number): any {
		for (let [index, beacon] of beacons.entries()) {
			if (distance(beacon.x, beacon.y, x, y) <= BEACON_RADIUS) {
				return [beacon, index];
			}
		}

		return null;
	}

	function distance(x1: number, y1: number, x2: number, y2: number) {
		return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
	}

	function canAddBeacon() {}

	function maybeRemoveBeacon(ctx: CanvasRenderingContext2D, x: number, y: number) {
		// check if there is a beacon there
		let foundBeacon = findBeacon(x, y);
		if (foundBeacon) {
			let [beacon, index] = foundBeacon;

			// remove
			console.log('removing');

			ctx.clearRect(
				beacon.x - BEACON_RADIUS,
				beacon.y - BEACON_RADIUS,
				BEACON_RADIUS * 3,
				BEACON_RADIUS * 3
			);

			beacons.splice(index, 1);
		}
	}

	function addBeacon(ctx: CanvasRenderingContext2D, x: number, y: number) {
		console.log({ x, y });

		ctx.beginPath();
		ctx.arc(x, y, BEACON_RADIUS, 0, 2 * Math.PI);
		ctx.fillStyle = 'red';
		ctx.fill();

		beacons.push({ x, y });
	}

	function handleMouseDown(event: any) {
		if (event.button == 2) {
			let { x, y } = getMousePosition(canvas!, event);
			maybeRemoveBeacon(context!, x, y);
			console.log('asdsad');
		}
		event.preventDefault();
	}
</script>

<div class="relative max-w-max" id="parent" on:mousedown={handleMouseDown}>
	<img src={storePlan} width="600" />
	<canvas on:click={handleClick} id="canvas" class="absolute top-0" oncontextmenu="return false" />
</div>

<style>
</style>
