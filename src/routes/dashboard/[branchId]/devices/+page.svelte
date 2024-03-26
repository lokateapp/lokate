<script lang="ts">
	import { onMount } from 'svelte';
	import type KonvaType from 'konva';
	import type { PageData } from './$types';
	import {
		Table,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Checkbox,
		Button,
		Label,
		Input,
		Range,
		PaginationItem
	} from 'flowbite-svelte';
	import dayjs from 'dayjs';

	import localizedFormat from 'dayjs/plugin/localizedFormat';
	dayjs.extend(localizedFormat);

	type BeaconType = {
		id: string;
		name: string | null;
		branchId: string;
		proximityUUID: string;
		major: number;
		minor: number;
		radius: number;
		floorplan: {
			beaconId: string;
			floorplanId: string;
			x: number;
			y: number;
		} | null;
	};

	export let data: PageData;

	const branchId = data.branchId;
	const devices = data.beacons;
	const floorplan = data.floorplan;

	// console.log('devices:', devices);
	const items = devices;

	let selectedRows: number[] = []; // = [0, 1, 2]
	let editRow: number;

	// $: if (selectedBeaconsForNewCampaign.length != beaconsForNewCampaign.length) {
	// 	// beaconsForNewCampaign = selectedBeaconsForNewCampaign.map((beaconId) => {
	// 	// 	return {
	// 	// 		id: beaconId,
	// 	// 		name: `Beacon ${beaconId}`,
	// 	// 		position: null,
	// 	// 		range: MIN_RANGE_BEACON,
	// 	// 		status: 'not-active'
	// 	// 	};
	// 	// });
	// 	// console.log('beaconsForNewCampaign:', beaconsForNewCampaign);
	// }

	const toggleDevices = (i: any) => {
		isDraggable = false;
		// console.log('selectedRows:', selectedRows, ' i:', i);
		if (selectedRows?.includes(i)) {
			selectedRows = selectedRows.filter((row) => row !== i);
		} else {
			selectedRows = [...selectedRows, i];
		}
	};

	const toggleAllDevices = () => {
		isDraggable = false;
		if (selectedRows.length === items.length) {
			selectedRows = [];
		} else {
			selectedRows = items.map((_, i) => i);
		}
	};

	const closeAllDevices = () => {
		isDraggable = false;
		selectedRows = [];
	};

	let Konva: typeof KonvaType;
	let layer: KonvaType.Layer;
	let tooltipLayer: KonvaType.Layer;
	let tooltip: KonvaType.Label;
	let stage: KonvaType.Stage;
	let backgroundImage: KonvaType.Image;
	let rightSideContent: boolean = false;
	let range: number = 1;

	let isAddLocationToDevice: boolean = false;
	let deviceToAddLocation: BeaconType | null = null;
	let isDraggable: boolean = false;

	const MIN_RANGE_BEACON = 1;
	const MAX_RANGE_BEACON = 15;
	const BEACON_RANGE_STEP = 1;

	const CANVAS_WIDTH = data.floorplanImgWidth;
	const CANVAS_HEIGHT = data.floorplanImgHeight;

	onMount(async () => {
		Konva = (await import('konva')).default;
		// const parent: HTMLCanvasElement = document.getElementById('parent')! as HTMLCanvasElement;
		// console.log('parent:', parent.clientWidth, parent.clientHeight);
		const clientHeight = document.documentElement.clientHeight;
		const clientWidth = document.documentElement.clientWidth;
		var konvaStage = new Konva.Stage({
			container: 'canvas', // id of container <div>
			width: CANVAS_WIDTH,
			height: CANVAS_HEIGHT
			// height: 400,
			// width: parent.clientWidth,
			// height: parent.clientHeight
		});
		stage = konvaStage;

		// then create layer
		var konvaLayer = new Konva.Layer();
		var konvaBackgroundLayer = new Konva.Layer();
		var konvaTooltipLayer = new Konva.Layer();

		// add the layer to the stage
		stage.add(konvaLayer);
		stage.add(konvaBackgroundLayer);
		stage.add(konvaTooltipLayer);

		// draw the image
		konvaLayer.draw();
		layer = konvaLayer;

		tooltipLayer = konvaTooltipLayer;

		// tooltip = new Konva.Text({
		// 	text: '',
		// 	fontFamily: 'Calibri',
		// 	fontSize: 12,
		// 	padding: 5,
		// 	textFill: 'white',
		// 	fill: 'black',
		// 	alpha: 0.75,
		// 	visible: false,
		// });

		tooltip = new Konva.Label({
			x: 0,
			y: 0,
			opacity: 0.9
		});

		tooltip.add(
			new Konva.Tag({
				fill: 'black',
				pointerDirection: 'down',
				pointerWidth: 10,
				pointerHeight: 10,
				lineJoin: 'round',
				shadowColor: 'black',
				shadowBlur: 10,
				shadowOffsetX: 10,
				shadowOffsetY: 10,
				shadowOpacity: 0.5
			})
		);

		tooltip.add(
			new Konva.Text({
				text: '',
				fontFamily: 'Calibri',
				fontSize: 18,
				padding: 5,
				fill: 'white'
			})
		);

		tooltipLayer.add(tooltip);
		tooltip.hide();

		// add stage a background image
		if (floorplan?.imgPath) {
			var imageObj = new Image();
			imageObj.src = floorplan.imgPath;
			imageObj.onload = function () {
				backgroundImage = new Konva.Image({
					x: 0,
					y: 0,
					image: imageObj,
					width: stage.width(),
					height: stage.height()
				});

				// add the shape to the layer
				konvaBackgroundLayer.add(backgroundImage);
				konvaBackgroundLayer.moveToBottom();
				konvaBackgroundLayer.draw();
			};

			// place beacons that are located before to the storeplan
			devices.forEach((beacon) => {
				if (beacon.floorplan != null && beacon.floorplan.floorplanId == floorplan.id) {
					// TODO
				}
			});
		}

		stage.on('pointerdown', addLocationToBeacon);

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

	const BEACON_RANGE = 10;

	let beaconsMap: BeaconType[] = [];

	$: {
		updateMapDelete();
		if (beaconsMap.length > 0) {
			beaconsMap.forEach((beacon: BeaconType) => {
				addBeaconToMap(beacon, isDraggable);
			});
		}
	}

	$: items.forEach((device) => {
		if (beaconsMap.includes(device)) {
			beaconsMap = beaconsMap.map((beaconMap) => {
				if (beaconMap.id == device.id) {
					beaconMap = device;
				}
				return beaconMap;
			});
		}
	});

	$: {
		if (layer) {
			updateMapDelete();
			if (!isDraggable && selectedRows && selectedRows.length > 0) {
				console.log('selectedRows:', selectedRows);
				selectedRows.forEach((row) => {
					addBeaconToMap(items[row]);
				});
			}
		}
	}

	const addBeaconToMap = (beacon: BeaconType, draggable: boolean = false) => {
		// let pos = stage.getPointerPosition() || { x: 0, y: 0 };
		const pos = beacon.floorplan;
		const beaconName = beacon.name;
		if (!pos) {
			return;
		}

		const circles = layer.find('Circle');
		if (circles && circles.length > 0) {
			circles.forEach((circle: any) => {
				if (circle.x() == pos.x && circle.y() == pos.y) {
					return;
				}
			});
		}
		const beaconRange = beacon.radius;
		Konva.Image.fromURL('/src/lib/assets/beacon.svg', function (beaconSvg) {
			const IMAGE_W = beaconSvg.getWidth() / 20;
			const IMAGE_H = beaconSvg.getHeight() / 20;
			// console.log('beacon:', beacon);
			// beacon.fill('red');
			// change background color to red
			beaconSvg.offset({
				x: IMAGE_W,
				y: IMAGE_H
			});
			beaconSvg.position({
				x: pos.x,
				y: pos.y
			});
			beaconSvg.size({
				width: IMAGE_W * 2,
				height: IMAGE_H * 2
			});
			beaconSvg.draggable(draggable);
			if (draggable) {
				beaconSvg.dragBoundFunc(function (pos: any) {
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
			}

			beaconSvg.id(beacon.id.toString());

			var circleRange = new Konva.Circle({
				x: pos.x,
				y: pos.y,
				radius: beaconRange,
				stroke: 'red',
				strokeWidth: 1,
				fill: 'red',
				opacity: 0.2
			});

			circleRange.id(beacon.id.toString());

			// add the shape to the layer
			beaconSvg.on('pointerdblclick', removeBeacon);

			beaconSvg.on('pointerclick', (event: any) => {
				rightSideContent = true;
				// console.log(event);
				// event.target.fill('blue');
				// layer.draw();
			});

			// mousemove
			beaconSvg.on('pointerenter', (event: any) => {
				// scale up
				event.target.scale({ x: 1.1, y: 1.1 });

				// update tooltip
				// tooltip.getText().text(`Beacon ${beaconsMap.length}`);
				tooltip.getText().setText(`${beaconName}`);

				tooltip.position({
					x: event.target.x(),
					y: event.target.y()
				});
				// tooltip.text(`Beacon ${beaconsMap.length}`);
				tooltip.show();
				layer.draw();
			});

			// mouseout
			beaconSvg.on('pointerleave', (event: any) => {
				// scale down
				event.target.scale({ x: 1, y: 1 });
				layer.draw();
				// setTimeout(() => {
				// }, 1000);
				tooltip.hide();
			});

			if (draggable) {
				beaconSvg.on('dragmove', (event: any) => {
					// bind beacon position
					beacon.floorplan = {
						beaconId: pos.beaconId,
						floorplanId: pos.floorplanId,
						x: event.target.x(),
						y: event.target.y()
					};
					// update beaconsMap position
					// beaconsMap = beaconsMap.map((beaconMap) => {
					// 	if (beaconMap.id == beacon.id) {
					// 		beaconMap.position = {
					// 			x: event.target.x(),
					// 			y: event.target.y()
					// 		};
					// 	}
					// 	return beaconMap;
					// });
					// console.log(event);
					circleRange.x(event.target.x());
					circleRange.y(event.target.y());
					layer.draw();
				});
			}

			layer.add(circleRange);
			layer.add(beaconSvg);
			layer.draw();
		});
	};

	const addLocationToBeacon = (event: any) => {
		if (!isAddLocationToDevice || deviceToAddLocation == null) {
			return;
		}
		// console.log('event:', event);
		if (event.target == backgroundImage) {
			const beaconRange = deviceToAddLocation.radius;
			const beaconName = deviceToAddLocation.name;

			let pos = stage.getPointerPosition() || { x: 0, y: 0 };
			console.log('pos:', pos);

			items.forEach((item) => {
				if (item.id == deviceToAddLocation?.id && floorplan) {
					item.floorplan = {
						beaconId: item.id,
						floorplanId: floorplan.id,
						x: pos.x,
						y: pos.y
					};
				}
			});

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
				const IMAGE_W = beacon.getWidth() / 5;
				const IMAGE_H = beacon.getHeight() / 5;
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

				var circleRange = new Konva.Circle({
					x: pos.x,
					y: pos.y,
					radius: BEACON_RANGE * beaconRange,
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

				// mousemove
				beacon.on('pointerenter', (event: any) => {
					// scale up
					event.target.scale({ x: 1.1, y: 1.1 });

					// update tooltip
					// tooltip.getText().text(`Beacon ${beaconsMap.length}`);
					tooltip.getText().setText(`${beaconName}`);

					tooltip.position({
						x: event.target.x(),
						y: event.target.y()
					});
					// tooltip.text(`Beacon ${beaconsMap.length}`);
					tooltip.show();
					layer.draw();
				});

				// mouseout
				beacon.on('pointerleave', (event: any) => {
					// scale down
					event.target.scale({ x: 1, y: 1 });
					layer.draw();
					// setTimeout(() => {
					// }, 1000);
					tooltip.hide();
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

				// beaconsMap.push({
				// 	id: beaconsMap.length + 1,
				// 	position: {
				// 		x: beacon.x(),
				// 		y: beacon.y()
				// 	}
				// });
			});
			deviceToAddLocation = null;
			isAddLocationToDevice = false;
		}
	};

	const addRangeToBeacon = (beacon: BeaconType) => {
		if (!beacon.floorplan) {
			return;
		}
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
			if (!beacon.floorplan) {
				return;
			}
			return circle.x() == beacon.floorplan.x && circle.y() == beacon.floorplan.y;
		});

		if (!circleRange) {
			return;
		}
		// update the circle range
		circleRange.setAttrs({
			radius: BEACON_RANGE * range
		});

		layer.draw();
	};

	const removeBeacon = (event: any) => {
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
	};

	const addNewLocationToDevice = (device: BeaconType) => {
		console.log('addNewLocationToDevice beacon:', device);
		closeAllDevices();
		isAddLocationToDevice = true;
		deviceToAddLocation = device;
		updateMapDelete();
	};

	const saveChanges = async () => {
		console.log('items:', items);

		await fetch('/api/beacons', {
			method: 'POST',
			body: JSON.stringify({
				items: items
			}),
			headers: {
				'content-type': 'application/json'
			}
		}).then((res) => {
			console.log('res:', res);
			if (res.status === 200) {
				console.log('Success');
			} else {
				console.log('Error');
			}
		});
	};

	const changeBeaconLocation = (beacon: BeaconType) => {
		closeAllDevices();
		isDraggable = true;
		beaconsMap = [beacon];
	};

	const updateMapDelete = () => {
		// beaconsInMap: BeaconType[]
		console.log('updateMapDelete');
		if (!layer) {
			return;
		}

		let beaconSvgs: KonvaType.Image[];
		let beaconRanges: KonvaType.Circle[];

		beaconSvgs = layer.find('Image');
		beaconRanges = layer.find('Circle');

		beaconSvgs.forEach((beaconSvg: KonvaType.Image) => {
			beaconSvg.destroy();
		});

		beaconRanges.forEach((beaconRange: KonvaType.Circle) => {
			beaconRange.destroy();
		});
	};

	const previousTable = () => {
		alert('Previous btn clicked. Make a call to your server to fetch data.');
	};
	const nextTable = () => {
		alert('Next btn clicked. Make a call to your server to fetch data.');
	};
</script>

<div class="grid grid-cols-3 p-5 gap-5">
	<div class="col-span-2 flex flex-col gap-5">
		<div>
			<div class="flex flex-col p-5 gap-10 justify-center">
				<div class="flex flex-row justify-between">
					<h1 class="text-3xl font-semibold text-gray-800">Devices</h1>
					<!-- <div class="flex flex-row">
					<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
						Request new beacon
					</button>
				</div> -->
				</div>
				<div class="">
					<div class="flex flex-row justify-between items-center px-5 py-5 bg-slate-100">
						<p />
						<!-- <p class="text-xl font-semibold text-gray-900 dark:text-white">Campaigns</p> -->
						<!-- <form method="POST" action="?/saveChanges"> -->
						<div>
							<Button
								color="green"
								pill
								on:click={() => {
									saveChanges();
								}}
								type="submit"
							>
								<i class="fa-solid fa-save fa-lg me-2" />
								Save
							</Button>
						</div>
						<!-- </form> -->
					</div>
					<Table hoverable={true} shadow>
						<TableHead>
							<TableBodyCell class="!p-4">
								<Checkbox
									checked={selectedRows?.length === items.length}
									on:change={() => {
										// isDraggable = false;
										// console.log('isDraggable:', isDraggable);
										// if (selectedRows?.length === items.length) {
										// 	selectedRows = [];
										// } else {
										// 	selectedRows = [...Array(items.length).keys()];
										// }
										toggleAllDevices();
									}}
								/>
							</TableBodyCell>
							<TableHeadCell>Beacon ID</TableHeadCell>
							<TableHeadCell>Name</TableHeadCell>
							<TableHeadCell>Range</TableHeadCell>
							<TableHeadCell>Major</TableHeadCell>
							<TableHeadCell>Minor</TableHeadCell>
							<TableHeadCell>
								<span class="sr-only">Edit</span>
							</TableHeadCell>
						</TableHead>
						{#each devices as device, device_index}
							<TableBodyRow
								on:click={() => {
									console.log('device:', device);
									if (editRow === device_index) {
										editRow = -1;
									} else {
										editRow = device_index;
									}
								}}
							>
								<!-- <TableBodyCell class="!p-4">
									<label class="swap">
										<input
											type="checkbox"
											class="hidden"
											checked={selectedRows.includes(device_index)}
											on:change={() => {
												toggleDevices(device_index);
											}}
										/>

										<i class="swap-on fa-solid fa-eye fa-xl" />
										<i class="swap-off fa-solid fa-eye-slash fa-xl" />
									</label>
								</TableBodyCell> -->
								<TableBodyCell />
								<!-- tdClass="max-w-[200px]" -->
								<TableBodyCell>{device.id}</TableBodyCell>
								<TableBodyCell>{device.name}</TableBodyCell>
								<TableBodyCell>{device.radius} m.</TableBodyCell>
								<TableBodyCell>{device.major}</TableBodyCell>
								<TableBodyCell>{device.minor}</TableBodyCell>
								<TableBodyCell class="!p-4">
									<div class="">
										{#if editRow === device_index}
											<i class="fa-solid fa-angle-up" />
										{:else}
											<i class="fa-solid fa-angle-down" />
										{/if}
									</div>
								</TableBodyCell>

								<!-- <TableBodyCell>
								<Label>Range steps</Label>
								<Range
									id="table-beacon-range"
									min={MIN_RANGE_BEACON}
									max={MAX_RANGE_BEACON}
									bind:value={beacon.range}
									step="0.5"
								/>
								<p>Value: {beacon.range}</p>
							</TableBodyCell> -->
								<!-- <TableBodyCell>
								{#if beacon.status == 'active'}
									<Badge rounded color="green">Active</Badge>
								{:else}
									<Badge rounded color="red">Not-Active</Badge>
								{/if}
							</TableBodyCell> -->
							</TableBodyRow>
							{#if editRow === device_index}
								<TableBodyRow>
									<TableBodyCell colspan="7" class="p-3">
										<TableBodyCell />
										<TableBodyCell>
											<div class="flex flex-row justify-between items-center">
												<div class="mb-2">
													<Label for="beacon-name" class="block mb-2">Beacon Name</Label>
													<Input
														id="beacon-name"
														placeholder={device.name}
														bind:value={device.name}
													/>
												</div>
											</div>
										</TableBodyCell>
										<TableBodyCell>
											<Label>Range steps</Label>
											<Range
												id="table-beacon-range"
												min={MIN_RANGE_BEACON}
												max={MAX_RANGE_BEACON}
												bind:value={device.radius}
												step={BEACON_RANGE_STEP}
											/>
											<p>Value: {device.radius} meters</p>
										</TableBodyCell>
										<TableBodyCell>
											{#if device.floorplan != undefined}
												<div class="tooltip tooltip-top" data-tip="Change location">
													<Button
														color="blue"
														pill
														class="!p-2"
														on:click={() => {
															changeBeaconLocation(device);
														}}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															height="24"
															viewBox="0 0 24 24"
															width="24"
															fill="white"
														>
															<path d="M0 0h24v24H0z" fill="none" />
															<path
																d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm-1.56 10H9v-1.44l3.35-3.34 1.43 1.43L10.44 12zm4.45-4.45l-.7.7-1.44-1.44.7-.7c.15-.15.39-.15.54 0l.9.9c.15.15.15.39 0 .54z"
															/>
														</svg>
													</Button>
												</div>
											{:else}
												<div class="tooltip tooltip-top" data-tip="Add location">
													<Button
														color="alternative"
														pill
														on:click={() => {
															addNewLocationToDevice(device);
														}}
													>
														Add Location
													</Button>
												</div>
											{/if}
										</TableBodyCell>
									</TableBodyCell>
								</TableBodyRow>
							{/if}
						{/each}
					</Table>
					<div class="flex justify-end space-x-3 py-5">
						<PaginationItem large on:click={previousTable}>Previous</PaginationItem>
						<PaginationItem large on:click={nextTable}>Next</PaginationItem>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="relative max-w-fit" id="parent">
		<!-- <img src={storePlan} width="600" alt="Store plan" /> -->
		<div id="canvas" class="" />
	</div>
</div>
