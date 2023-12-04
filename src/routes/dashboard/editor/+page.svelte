<script lang="ts">
	import storePlan from '$lib/assets/store_plan.webp';
	// import yellowBeacon from '$lib/assets/yellowbeacon.png';
	import BeaconSvg from '$lib/assets/beacon.svg';
	import { onMount } from 'svelte';

	import type KonvaType from 'konva';

	import {
		ListBox,
		ListBoxItem,
		Table as SkeletonTable,
		tableMapperValues,
		type TableSource
	} from '@skeletonlabs/skeleton';

	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Modal,
		Checkbox,
		Button,
		Label,
		Input,
		MultiSelect,
		Badge,
		ImagePlaceholder,
		Range,
		Toggle
	} from 'flowbite-svelte';

	let selectedRows: number[] = [0, 1, 2];
	let editRow: number;
	const items = [
		{
			name: 'Campaign 1',
			description: 'Campaign 1 description',
			beacons: [
				{
					id: 1,
					name: 'Beacon 1',
					position: {
						x: 100,
						y: 100
					},
					range: 10,
					status: 'active'
				},
				{
					id: 2,
					name: 'Beacon 2',
					position: {
						x: 200,
						y: 200
					},
					range: 2,
					status: 'active'
				},
				{
					id: 3,
					name: 'Beacon 3',
					position: {
						x: 300,
						y: 300
					},
					range: 1,
					status: 'active'
				}
			],
			created: '2021-09-01',
			status: 'active',
			isCompleted: true
		},
		{
			name: 'Campaign 2',
			description: 'Campaign 2 description',
			beacons: [
				{
					id: 1,
					name: 'Beacon 1',
					position: null,
					range: 10,
					status: 'active'
				},
				{
					id: 2,
					name: 'Beacon 2',
					position: null,
					range: 10,
					status: 'active'
				},
				{
					id: 3,
					name: 'Beacon 3',
					position: null,
					range: 5,
					status: 'not-active'
				}
			],
			created: '2021-09-01',
			status: 'not-active',
			isCompleted: false
		},
		{
			name: 'Campaign 3',
			description: 'Campaign 3 description',
			beacons: [
				{
					id: 1,
					name: 'Beacon 1',
					position: {
						x: 100,
						y: 100
					},
					range: 5,
					status: 'not-active'
				},
				{
					id: 2,
					name: 'Beacon 2',
					position: {
						x: 200,
						y: 200
					},
					range: 10,
					status: 'not-active'
				},
				{
					id: 3,
					name: 'Beacon 3',
					position: {
						x: 300,
						y: 300
					},
					range: 5,
					status: 'active'
				}
			],
			created: '2021-09-01',
			status: 'not-active',
			isCompleted: true
		}
	];

	let selectedBeaconsForNewCampaign: any[] = [];
	let availableBeacons = [
		{ value: '1', name: 'Beacon 1' },
		{ value: '2', name: 'Beacon 2' },
		{ value: '3', name: 'Beacon 3' },
		{ value: '4', name: 'Beacon 4' },
		{ value: '5', name: 'Beacon 5' }
	];

	const toggleRow = (i: any) => {
		// console.log('selectedRows:', selectedRows, ' i:', i);
		if (selectedRows.includes(i)) {
			selectedRows = selectedRows.filter((row) => row !== i);
		} else {
			selectedRows = [...selectedRows, i];
		}
	};

	const sourceData = [
		{ position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
		{ position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
		{ position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
		{ position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
		{ position: 5, name: 'Boron', weight: 10.811, symbol: 'B' }
	];

	const tableSimple: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Symbol', 'Weight'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, ['name', 'symbol', 'weight']),
		// Optional: The data returned when interactive is enabled and a row is clicked.
		meta: tableMapperValues(sourceData, ['position', 'name', 'symbol', 'weight']),
		// Optional: A list of footer labels.
		foot: ['Total', '', '<code class="code">5</code>']
	};

	let campaigns: any[] = [
		{
			id: 1,
			name: 'Campaign 1'
		},
		{
			id: 2,
			name: 'Campaign 2'
		},
		{
			id: 3,
			name: 'Campaign 3'
		},
		{
			id: 4,
			name: 'Campaign 4'
		},
		{
			id: 5,
			name: 'Campaign 5'
		},
		{
			id: 6,
			name: 'Campaign 6'
		},
		{
			id: 7,
			name: 'Campaign 7'
		},
		{
			id: 8,
			name: 'Campaign 8'
		},
		{
			id: 9,
			name: 'Campaign 9'
		},
		{
			id: 10,
			name: 'Campaign 10'
		}
	];
	let allCampaignsId: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	let selectedCampaignsId: number[] = [...allCampaignsId];

	let isNewCampaignModalOpen: boolean = false;

	let Konva: typeof KonvaType;
	let layer: KonvaType.Layer;
	let stage: KonvaType.Stage;
	let backgroundImage: KonvaType.Image;
	// let layer: any;
	// let stage: any;
	let rightSideContent: boolean = false;
	let rangeOpen: boolean = false;
	let range: number = 1;

	const MIN_RANGE_BEACON = 1;
	const MAX_RANGE_BEACON = 15;

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

	let beaconsMap: Beacon[] = [];

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

			// var imageObj = new Image();
			// var imageObj = new Image();
			// imageObj.src = BeaconSvg;
			// console.log('imageObj:', imageObj.src);
			// // change style to fill red NOT WORKING
			// // imageObj.src = BeaconSvg;
			// imageObj.onload = function () {
			Konva.Image.fromURL('/src/lib/assets/beacon.svg', function (beacon) {
				const IMAGE_W = beacon.getWidth() / 7;
				const IMAGE_H = beacon.getHeight() / 7;
				// console.log('beacon:', beacon);
				// beacon.fill('red');
				// change background color to red
				beacon.offset({
					x: IMAGE_W,
					y: IMAGE_H
				});
				beacon.position({
					x: pos.x,
					y: pos.y
				});
				beacon.size({
					width: IMAGE_W * 2,
					height: IMAGE_H * 2
				});
				beacon.draggable(true);
				beacon.dragBoundFunc(function (pos: any) {
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
				});

				// var beacon = new Konva.Image({
				// 	x: pos.x,
				// 	y: pos.y,
				// 	offsetX: IMAGE_W,
				// 	offsetY: IMAGE_H,
				// 	image: imageObj,
				// 	// fillRule: 'nonzero',
				// 	// fill: 'red',
				// 	// crop: {
				// 	// 	x: 200,
				// 	// 	y: 100,
				// 	// 	width: 300,
				// 	// 	height: 300
				// 	// },
				// 	width: IMAGE_W * 2,
				// 	height: IMAGE_H * 2,
				// 	draggable: true,
				// 	// not draggable if outside of the area
				// 	dragBoundFunc: function (pos: any) {
				// 		var x = pos.x;
				// 		var y = pos.y;
				// 		const DELTA = 30; //BEACON_AREA_RADIUS
				// 		if (x < DELTA) {
				// 			x = DELTA;
				// 		}
				// 		if (x > stage.width() - DELTA) {
				// 			x = stage.width() - DELTA;
				// 		}
				// 		if (y < DELTA) {
				// 			y = DELTA;
				// 		}
				// 		if (y > stage.height() - DELTA) {
				// 			y = stage.height() - DELTA;
				// 		}
				// 		return {
				// 			x: x,
				// 			y: y
				// 		};
				// 	}
				// });

				var padding = 20;
				var w = beacon.getWidth();
				var h = beacon.getHeight();

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

				beaconsMap.push({ x: pos.x, y: pos.y });
			});
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

<!-- <ListBox multiple>
	{#each allCampaignsId as campaignId}
		<ListBoxItem bind:group={selectedCampaignsId} name="medium" value={campaignId}>
		{
			 'Id: ' + campaignId + ' Name: ' + 
			campaigns[campaignId]?.name
		}
		</ListBoxItem>
	{/each}
</ListBox> -->

<!-- <Table source={tableSimple} interactive={true}/> -->

<div class="grid gap-4 grid-cols-2">
	<div class="flex flex-col gap-5">
		<Table hoverable={true} shadow>
			<TableHead>
				<TableBodyCell class="!p-4">
					<Checkbox
						checked={selectedRows.length === items.length}
						on:change={() => {
							if (selectedRows.length === items.length) {
								selectedRows = [];
							} else {
								selectedRows = [...Array(items.length).keys()];
							}
						}}
					/>
				</TableBodyCell>
				<TableHeadCell>Campaign name</TableHeadCell>
				<TableHeadCell>Beacons</TableHeadCell>
				<TableHeadCell>Created</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
				<TableHeadCell>
					<span class="sr-only">Edit</span>
				</TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y">
				{#each items as item, i}
					<TableBodyRow
						on:click={(event) => {
							// console.log('event:',);
							toggleRow(i);
						}}
						class={selectedRows.includes(i) ? ' bg-gray-300' : 'bg-white'}
					>
						<TableBodyCell class="!p-4">
							<!-- <Checkbox checked={selectedRows.includes(i)} /> -->
							<label class="swap">
								<!-- this hidden checkbox controls the state -->
								<input
									type="checkbox"
									class="hidden"
									checked={selectedRows.includes(i)}
									on:change={() => {
										toggleRow(i);
									}}
								/>

								<i class="swap-on fa-solid fa-eye fa-xl" />
								<i class="swap-off fa-solid fa-eye-slash fa-xl" />
							</label>
						</TableBodyCell>
						<TableBodyCell>{item.name}</TableBodyCell>

						<!-- <TableBodyCell>{item.beacons.length}</TableBodyCell> -->
						<TableBodyCell>
							<!-- <ListBox multiple>
							{#each item.beacons as beacon}
								<ListBoxItem bind:group={selectedCampaignsId} name="medium" value={beacon.id}>
									{
										'Id: ' + beacon.id + ' Name: ' + 
										beacon.name
									}
								</ListBoxItem>
							{/each}
						</ListBox> -->
							{item.beacons.length}
						</TableBodyCell>
						<TableBodyCell>{item.created}</TableBodyCell>
						<TableBodyCell>
							{#if item.status == 'active'}
								<Badge rounded color="green">Active</Badge>
								<!-- {:else if item.status == 'not-completed'}
								<Badge rounded color="yellow">Not-Completed</Badge> -->
							{:else}
								<Badge rounded color="red">Not-Active</Badge>
							{/if}

							{#if !item.isCompleted}
								<div class="tooltip tooltip-top" data-tip="There are beacons without location">
									<Badge rounded color="yellow" class="!p-3">
										<i class="fa-solid fa-exclamation fa-lg" />

										<span class="sr-only">Icon description</span>
									</Badge>
								</div>
							{/if}
						</TableBodyCell>
						<TableBodyCell>
							<Button
								color="alternative"
								pill
								on:click={() => {
									console.log('Edit');
									if (editRow === i) {
										editRow = -1;
									} else {
										editRow = i;
									}
								}}>Edit</Button
							>

							<!-- <a href="/dashboard" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Edit</a> -->
						</TableBodyCell>
					</TableBodyRow>
					{#if editRow === i}
						<!-- <TableBodyCell colspan="4" class="p-0"> -->

						<TableBodyRow>
							<TableBodyCell colspan="6" class="p-3">
								<div class="flex flex-row justify-between items-center">
									<div class="mb-2">
										<Label for="campaign-name" class="block mb-2">Campaign Name</Label>
										<Input id="campaign-name" placeholder={item.name} bind:value={item.name} />
									</div>
									<div>
										<Button color="alternative" pill on:click={() => {}}>
											<i class="fa-solid fa-plus fa-lg me-2" />
											Add new beacon
										</Button>
									</div>
								</div>
								<Table>
									<TableHead>
										<TableHeadCell>Beacon ID</TableHeadCell>
										<TableHeadCell>Name</TableHeadCell>
										<TableHeadCell>Range</TableHeadCell>
										<TableHeadCell>Status</TableHeadCell>
									</TableHead>
									{#each item.beacons as beacon, beacon_index}
										<TableBodyRow>
											<TableBodyCell>{beacon.id}</TableBodyCell>
											<TableBodyCell>{beacon.name}</TableBodyCell>
											<TableBodyCell>
												<Label>Range steps</Label>
												<!-- bind:value={stepValue} -->
												<Range
													id="range-steps"
													min={MIN_RANGE_BEACON}
													max={MAX_RANGE_BEACON}
													bind:value={beacon.range}
													step="0.5"
												/>
												<p>Value: {beacon.range}</p>
											</TableBodyCell>
											<!-- <TableBodyCell>
										{#if beacon.status == 'active'}
											<Badge rounded color="green">Active</Badge>
										{:else}
											<Badge rounded color="red">Not-Active</Badge>
										{/if}
									</TableBodyCell> -->
											<TableBodyCell>
												{#if beacon.status == 'active'}
													<Toggle color="green" checked />
												{:else}
													<Toggle color="green" />
												{/if}
											</TableBodyCell>
											<TableBodyCell>
												{#if beacon.position != undefined}
													<Button color="alternative" pill on:click={() => {}}
														>Change Location</Button
													>
												{:else}
													<Button color="alternative" pill on:click={() => {}}>Add Location</Button>
												{/if}
											</TableBodyCell>
											<TableBodyCell>
												<Button color="red" pill on:click={() => {}}>Remove</Button>
											</TableBodyCell>
										</TableBodyRow>
									{/each}
								</Table>
								<!-- <div class="px-2 py-3">
									<ImagePlaceholder />
									<div>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quibusdam architecto quaerat dolor facere suscipit nobis consequuntur excepturi nulla sed similique quos quas possimus obcaecati asperiores, doloremque explicabo iusto itaque quia!</div>
								</div> -->
							</TableBodyCell>
						</TableBodyRow>
						<!-- <ListBox multiple>
								{#each item.beacons as beacon}
									<ListBoxItem bind:group={selectedCampaignsId} name="medium" value={beacon.id}>
										{
											'Id: ' + beacon.id + ' Name: ' + 
											beacon.name
										}
									</ListBoxItem>
								{/each}
							</ListBox> -->
						<!-- </TableBodyCell> -->
					{/if}
				{/each}
			</TableBody>
		</Table>
		<Button
			size="lg"
			color="alternative"
			pill
			on:click={() => {
				isNewCampaignModalOpen = true;
			}}
		>
			<i class="fa-solid fa-plus fa-xl me-2" />
			Create new campaign
		</Button>
	</div>
	<!-- <div class="bg-slate-200 w-10 h-10"></div> -->
	<div class="relative max-w-fit" id="parent">
		<!-- <img src={storePlan} width="600" alt="Store plan" /> -->
		<div id="canvas" class="" oncontextmenu="return false" />
		<!-- <Stage config={{ width: window.innerWidth, height: window.innerHeight }}>
			<Layer >
				{#each beacons as beacon}
					<Circle config={{ x: beacon.x, y: beacon.y, radius: BEACON_RADIUS, fill: 'red' }} />
				{/each}
				
			</Layer>
		  </Stage> -->
	</div>
	<!-- <img src="/src/lib/assets/beacon.svg" alt="Beacon" style="" /> -->
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
						<!-- <input
							class="input input-bordered input-primary w-full max-w-xs join-item"
							name="name"
							type="text"
							placeholder="Range"
							bind:value={range}
						/> -->
						<input
							type="range"
							min={MIN_RANGE_BEACON}
							max={MAX_RANGE_BEACON}
							class="range range-primary range-sm btn-wide"
							step="0.5"
							bind:value={range}
						/>
					</label>

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
						addRangeToBeacon(beaconsMap[beaconsMap.length - 1]);
						rangeOpen = false;
					}}
				>
					Apply
				</button>
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
			<label class="label">
				<span class="label-text">Range</span>
				<!-- <input
				class="input input-bordered input-primary w-full max-w-xs join-item"
				name="name"
				type="text"
				placeholder="Range"
				bind:value={range}
			/> -->
				<input
					type="range"
					min={MIN_RANGE_BEACON}
					max={MAX_RANGE_BEACON}
					class="range range-primary range-sm btn-wide"
					step="0.5"
					bind:value={range}
				/>
			</label>
			<div class="flex justify-center items-center">
				<span
					class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap"
				>
					{range}m
				</span>
			</div>
			<div class="card-actions">
				<button
					class="btn btn-primary"
					on:click={() => {
						addRangeToBeacon(beaconsMap[beaconsMap.length - 1]);
					}}>Apply</button
				>
			</div>
		</div>
	</div>
</dialog>

<!-- UPLOAD FILE -->
<!-- <div class="flex items-center justify-center w-full">
    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG (MAX 10 MB)</p>
        </div>
        <input id="dropzone-file" type="file" class="hidden" />
    </label>
</div>  -->

<Modal
	title="Create a new campaign"
	bind:open={isNewCampaignModalOpen}
	size="lg"
	autoclose
	outsideclose
>
	<div class="mb-6">
		<Label for="campaign-name" class="block mb-2">Campaign Name</Label>
		<Input id="campaign-name" placeholder="Campaign Name" />
	</div>

	<Label>
		Select beacons for this campaign
		<MultiSelect items={availableBeacons} bind:value={selectedBeaconsForNewCampaign} />
	</Label>

	{#each selectedBeaconsForNewCampaign as selectedBeacon}
		{selectedBeacon.name}
		<Label>Range steps</Label>
		<!-- bind:value={stepValue} -->
		<Range
			id="range-steps"
			min={MIN_RANGE_BEACON}
			max={MAX_RANGE_BEACON}
			bind:value={selectedBeacon.range}
			step="0.5"
		/>
		<p>Value: {selectedBeacon.range}</p>
	{/each}

	<svelte:fragment slot="footer">
		<Button color="green" on:click={() => alert('Handle "success"')}>Create</Button>
		<Button color="alternative">Cancel</Button>
	</svelte:fragment>
</Modal>

<!-- FLOATING ACTION BUTTON FOR NEW CAMPAIGN -->
<!-- <div data-dial-init class="fixed end-10 bottom-10 group">
	<div id="speed-dial-menu-default" class="flex flex-col items-center hidden mb-4 space-y-2">
		<button
			type="button"
			data-tooltip-target="tooltip-share"
			data-tooltip-placement="left"
			class="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
		>
			<svg
				class="w-5 h-5"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				viewBox="0 0 18 18"
			>
				<path
					d="M14.419 10.581a3.564 3.564 0 0 0-2.574 1.1l-4.756-2.49a3.54 3.54 0 0 0 .072-.71 3.55 3.55 0 0 0-.043-.428L11.67 6.1a3.56 3.56 0 1 0-.831-2.265c.006.143.02.286.043.428L6.33 6.218a3.573 3.573 0 1 0-.175 4.743l4.756 2.491a3.58 3.58 0 1 0 3.508-2.871Z"
				/>
			</svg>
			<span class="sr-only">Share</span>
		</button>
		<div
			id="tooltip-share"
			role="tooltip"
			class="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
		>
			Share
			<div class="tooltip-arrow" data-popper-arrow />
		</div>
		<button
			type="button"
			data-tooltip-target="tooltip-print"
			data-tooltip-placement="left"
			class="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
		>
			<svg
				class="w-5 h-5"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				<path d="M5 20h10a1 1 0 0 0 1-1v-5H4v5a1 1 0 0 0 1 1Z" />
				<path
					d="M18 7H2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2v-3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-1-2V2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3h14Z"
				/>
			</svg>
			<span class="sr-only">Print</span>
		</button>
		<div
			id="tooltip-print"
			role="tooltip"
			class="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
		>
			Print
			<div class="tooltip-arrow" data-popper-arrow />
		</div>
		<button
			type="button"
			data-tooltip-target="tooltip-download"
			data-tooltip-placement="left"
			class="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
		>
			<svg
				class="w-5 h-5"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				<path
					d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"
				/>
				<path
					d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
				/>
			</svg>
			<span class="sr-only">Download</span>
		</button>
		<div
			id="tooltip-download"
			role="tooltip"
			class="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
		>
			Download
			<div class="tooltip-arrow" data-popper-arrow />
		</div>
		<button
			type="button"
			data-tooltip-target="tooltip-copy"
			data-tooltip-placement="left"
			class="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 dark:hover:text-white shadow-sm dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
		>
			<svg
				class="w-5 h-5"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				viewBox="0 0 18 20"
			>
				<path
					d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"
				/>
				<path
					d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z"
				/>
			</svg>
			<span class="sr-only">Copy</span>
		</button>
		<div
			id="tooltip-copy"
			role="tooltip"
			class="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
		>
			Copy
			<div class="tooltip-arrow" data-popper-arrow />
		</div>
	</div>
	<div class="tooltip tooltip-top" data-tip="New campaign">
		<button
			type="button"
			data-dial-toggle="speed-dial-menu-default"
			aria-controls="speed-dial-menu-default"
			aria-expanded="false"
			class="flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
		>
			<i class="fa-solid fa-plus fa-lg" />
			<span class="sr-only">Open actions menu</span>
		</button>
	</div>
</div> -->

<style>
</style>
