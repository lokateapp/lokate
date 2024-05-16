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
		Button,
		Label,
		Input,
		Range
	} from 'flowbite-svelte';
	import dayjs from 'dayjs';

	import localizedFormat from 'dayjs/plugin/localizedFormat';
	import type { SelectBeaconWithFloorplan } from '$lib/schema';
	import { notify } from '$components/notify';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	dayjs.extend(localizedFormat);

	export let data: PageData;

	// const SVG_URL =
	// 	'https://8nudshqewdlruco8.public.blob.vercel-storage.com/1713976455179_beacon-6H4OICwXNmAHIxkAW4iet0Pt4DIhUL.svg';
	// const SVG_URL = '/static/assets/beacon.svg';
	const SVG_URL =
		'https://6h5ykudqz8fkqypc.public.blob.vercel-storage.com/beacon-wVqaCJXRx0xzqZ8CAhCtEgHU5oQIwQ.svg';
	const {
		beacons: devices,
		floorplan,
		floorplanImgHeight: CANVAS_HEIGHT,
		floorplanImgWidth: CANVAS_WIDTH
	} = data;

	let itemOffset = 1;
	let itemsPerPage = 10;

	// $: items = devices.slice(
	// 	(itemOffset - 1) * itemsPerPage,
	// 	(itemOffset - 1) * itemsPerPage + itemsPerPage
	// );
	let items = devices;

	$: selectedRows = (items && items.map((_, i) => i)) || [];
	let editRow: number;

	const closeAllDevices = () => {
		isDraggable = false;
		selectedRows = [];
	};

	let Konva: typeof KonvaType;
	let layer: KonvaType.Layer;
	let tooltipLayer: KonvaType.Layer;
	let rangeLayer: KonvaType.Layer;

	let tooltip: KonvaType.Label;
	let stage: KonvaType.Stage;
	let backgroundImage: KonvaType.Image;

	let isAddLocationToDevice: boolean = false;
	let deviceToAddLocation: SelectBeaconWithFloorplan | null = null;
	let isDraggable: boolean = false;

	// let isSaveChanges: boolean = false;
	let isSaveChanges: { [key: string]: boolean } = {};

	const MIN_RANGE_BEACON = 1;
	const MAX_RANGE_BEACON = 15;
	const BEACON_RANGE_STEP = 1;

	let multiplier: number = 1;

	onMount(async () => {
		Konva = (await import('konva')).default;
		const parent = document.getElementById('parent')! as HTMLCanvasElement;
		// console.log('parent:', parent.clientWidth, parent.clientHeight);
		multiplier = parent.clientWidth / CANVAS_WIDTH;
		var konvaStage = new Konva.Stage({
			container: 'canvas',
			// width: CANVAS_WIDTH,
			// height: CANVAS_HEIGHT
			width: parent.clientWidth,
			height: CANVAS_HEIGHT * multiplier
		});
		stage = konvaStage;

		// then create layer
		var konvaBackgroundLayer = new Konva.Layer();
		var konvaRangeLayer = new Konva.Layer();
		var konvaLayer = new Konva.Layer();
		var konvaTooltipLayer = new Konva.Layer();

		// add the layer to the stage
		stage.add(konvaBackgroundLayer);
		stage.add(konvaRangeLayer);
		stage.add(konvaLayer);
		stage.add(konvaTooltipLayer);

		// draw the image
		konvaLayer.draw();
		layer = konvaLayer;
		rangeLayer = konvaRangeLayer;

		tooltipLayer = konvaTooltipLayer;
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
		}

		stage.on('pointerenter', (event: any) => {
			stage.container().style.cursor = 'pointer';
		});

		stage.on('pointerleave', (event: any) => {
			stage.container().style.cursor = 'default';
		});

		stage.on('pointerdown', addLocationToBeacon);

		var scaleBy = 1.01;
		stage.on('wheel', (e: any) => {
			// stop default scrolling
			e.evt.preventDefault();
			var oldScale = stage.scaleX();
			var pointer = stage.getPointerPosition();
			if (!pointer) {
				return;
			}
			var mousePointTo = {
				x: (pointer.x - stage.x()) / oldScale,
				y: (pointer.y - stage.y()) / oldScale
			};
			// how to scale? Zoom in? Or zoom out?
			let direction = e.evt.deltaY > 0 ? 1 : -1;
			// when we zoom on trackpad, e.evt.ctrlKey is true
			// in that case lets revert direction
			if (e.evt.ctrlKey) {
				direction = -direction;
			}
			var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
			if (newScale <= 1) {
				var newPos = {
					x: 0,
					y: 0
				};
				stage.position(newPos);
				return;
			} else if (newScale > 3) {
				return;
			}
			stage.scale({ x: newScale, y: newScale });
			var newPos = {
				x: pointer.x - mousePointTo.x * newScale,
				y: pointer.y - mousePointTo.y * newScale
			};
			stage.position(newPos);
		});
	});

	const BEACON_RANGE = 1.5;

	let beaconsMap: SelectBeaconWithFloorplan[] = [];

	$: {
		updateMapDelete();
		if (beaconsMap.length > 0) {
			beaconsMap.forEach((beacon) => {
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

	const addBeaconToMap = (beacon: SelectBeaconWithFloorplan, draggable: boolean = false) => {
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
		Konva.Image.fromURL(SVG_URL, function (beaconSvg) {
			const IMAGE_W = beaconSvg.getWidth() / 15;
			const IMAGE_H = beaconSvg.getHeight() / 15;
			// console.log('beacon:', beacon);
			// beacon.fill('red');
			// change background color to red
			beaconSvg.offset({
				x: IMAGE_W,
				y: IMAGE_H
			});
			beaconSvg.position({
				x: pos.x * multiplier,
				y: pos.y * multiplier
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
				x: beaconSvg.x(),
				y: beaconSvg.y(),
				radius: beaconRange * BEACON_RANGE,
				stroke: 'red',
				strokeWidth: 1,
				fill: 'red',
				opacity: 0.2
			});

			circleRange.id(beacon.id.toString());

			tooltip = new Konva.Label({
				x: beaconSvg.x(),
				y: beaconSvg.y(),
				opacity: 0.9
			});

			tooltip.add(
				new Konva.Tag({
					fill: 'rgba(0,0,0,0.7)',
					cornerRadius: 5,
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
					text: `${beaconName}`,
					fontFamily: 'Calibri',
					fontSize: 18,
					padding: 5,
					fill: 'white'
				})
			);

			tooltip.id(beacon.id.toString());

			beaconSvg.on('pointerenter', (event: any) => {
				event.target.scale({ x: 1.3, y: 1.3 });
				layer.draw();
			});

			beaconSvg.on('pointerleave', (event: any) => {
				event.target.scale({ x: 1, y: 1 });
				layer.draw();
			});

			if (draggable) {
				beaconSvg.on('dragmove', (event: any) => {
					isSaveChanges[beacon.id] = true;
					beacon.floorplan = {
						beaconId: pos.beaconId,
						floorplanId: pos.floorplanId,
						x: event.target.x() / multiplier,
						y: event.target.y() / multiplier
					};
					circleRange.x(event.target.x());
					circleRange.y(event.target.y());

					tooltip.position({
						x: event.target.x(),
						y: event.target.y()
					});
					layer.draw();
				});
			}

			tooltipLayer.add(tooltip);
			rangeLayer.add(circleRange);
			layer.add(beaconSvg);
			layer.draw();
		});
	};

	const addLocationToBeacon = (event: any) => {
		if (!isAddLocationToDevice || deviceToAddLocation == null) {
			return;
		}
		if (event.target == backgroundImage) {
			const beaconRange = deviceToAddLocation.radius;
			const beaconName = deviceToAddLocation.name;

			let pos = stage.getPointerPosition() || { x: 0, y: 0 };

			items.forEach((item) => {
				if (item.id == deviceToAddLocation?.id && floorplan) {
					item.floorplan = {
						beaconId: item.id,
						floorplanId: floorplan.id,
						x: pos.x / multiplier,
						y: pos.y / multiplier
					};
				}
			});

			Konva.Image.fromURL(SVG_URL, function (beacon) {
				const IMAGE_W = beacon.getWidth() / 5;
				const IMAGE_H = beacon.getHeight() / 5;
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
					radius: beaconRange * BEACON_RANGE,
					stroke: 'red',
					strokeWidth: 1,
					fill: 'red',
					opacity: 0.2
				});

				tooltip = new Konva.Label({
					x: pos.x,
					y: pos.y,
					opacity: 0.9
				});

				tooltip.add(
					new Konva.Tag({
						fill: 'rgba(0,0,0,0.7)',
						cornerRadius: 5,
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
						text: `${beaconName}`,
						fontFamily: 'Calibri',
						fontSize: 18,
						padding: 5,
						fill: 'white'
					})
				);

				tooltip.id(beacon.id.toString());

				beacon.on('pointerenter', (event: any) => {
					event.target.scale({ x: 1.1, y: 1.1 });
					layer.draw();
				});

				beacon.on('pointerleave', (event: any) => {
					event.target.scale({ x: 1, y: 1 });
					layer.draw();
				});

				beacon.on('dragmove', (event: any) => {
					circleRange.x(event.target.x());
					circleRange.y(event.target.y());
					layer.draw();
				});

				tooltipLayer.add(tooltip);
				rangeLayer.add(circleRange);
				layer.add(beacon);
				layer.draw();
			});
			deviceToAddLocation = null;
			isAddLocationToDevice = false;
		}
	};

	const addNewLocationToDevice = (device: SelectBeaconWithFloorplan) => {
		// console.log('addNewLocationToDevice beacon:', device);
		closeAllDevices();
		isAddLocationToDevice = true;
		deviceToAddLocation = device;
		updateMapDelete();
	};

	const saveChanges = async ({ device }: { device: SelectBeaconWithFloorplan }) => {
		await fetch('/api/beacons', {
			method: 'POST',
			body: JSON.stringify({
				beaconId: device.id,
				name: device.name,
				radius: device.radius,
				floorplan: device.floorplan
			}),
			headers: {
				'content-type': 'application/json'
			}
		}).then((res) => {
			if (res.status === 200) {
				isSaveChanges[device.id] = false;
				isDraggable = false;
				notify('Changes saved successfully', 'success');
			} else {
				notify('Error saving changes', 'error');
			}
		});
	};

	const changeBeaconLocation = (beacon: SelectBeaconWithFloorplan) => {
		closeAllDevices();
		isDraggable = true;
		beaconsMap = [beacon];
	};

	const updateMapDelete = () => {
		if (!layer) {
			return;
		}

		let beaconSvgs: KonvaType.Image[];
		let beaconRanges: KonvaType.Circle[];

		let beaconLabels: KonvaType.Label[];

		beaconLabels = tooltipLayer.find('Label');

		beaconLabels.forEach((beaconLabel: KonvaType.Label) => {
			beaconLabel.destroy();
		});

		beaconSvgs = layer.find('Image');
		beaconRanges = rangeLayer.find('Circle');

		beaconSvgs.forEach((beaconSvg: KonvaType.Image) => {
			beaconSvg.destroy();
		});

		beaconRanges.forEach((beaconRange: KonvaType.Circle) => {
			beaconRange.destroy();
		});
	};
</script>

<div class="grid grid-cols-4 p-5 gap-5">
	<div class="col-span-2 flex flex-col gap-5">
		<div>
			<div class="flex flex-col gap-10 justify-center">
				<div class="flex flex-row justify-between">
					<h1 class="text-3xl font-semibold text-gray-800">Devices</h1>
				</div>
				<div class="">
					<Table hoverable={true} shadow>
						<TableHead>
							<TableHeadCell>Name</TableHeadCell>
							<TableHeadCell>Range</TableHeadCell>
							<TableHeadCell>Major</TableHeadCell>
							<TableHeadCell>Minor</TableHeadCell>
							<TableHeadCell>
								<span class="sr-only">Edit</span>
							</TableHeadCell>
						</TableHead>
						{#each items as device, device_index}
							<TableBodyRow
								on:click={() => {
									if (editRow === device_index) {
										editRow = -1;
										if (!isDraggable) {
											selectedRows = (items && items.map((_, i) => i)) || [];
										}
									} else {
										editRow = device_index;
										if (!isDraggable) {
											selectedRows = [device_index];
										}
									}
								}}
							>
								<TableBodyCell>
									{device.name}
								</TableBodyCell>
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
							</TableBodyRow>
							{#if editRow === device_index}
								<TableBodyRow>
									<TableBodyCell colspan={5}>
										<p>Beacon ID: {device.id}</p>
										<div class="flex flex-row justify-between items-center mt-3">
											<div class="">
												<Label for="beacon-name" class="block mb-2">Beacon Name</Label>
												<Input
													id="beacon-name"
													placeholder={device.name}
													bind:value={device.name}
													on:input={(e) => {
														isSaveChanges[device.id] = true;
													}}
												/>
											</div>
											<div>
												<Label>Beacon Range</Label>
												<Range
													id="table-beacon-range"
													min={MIN_RANGE_BEACON}
													max={MAX_RANGE_BEACON}
													bind:value={device.radius}
													on:change={(e) => {
														isSaveChanges[device.id] = true;
														// updateBeaconInfo(e, false);
													}}
													step={BEACON_RANGE_STEP}
												/>
												<p>
													{device.radius} meters
												</p>
											</div>
											<div>
												{#if device.floorplan != undefined}
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
														Change Location
													</Button>
													<!-- <Tooltip trigger="click">Change location</Tooltip> -->
												{:else}
													<Button
														color="alternative"
														pill
														on:click={() => {
															addNewLocationToDevice(device);
														}}
													>
														Add Location
													</Button>
												{/if}
											</div>
											<div>
												{#if isSaveChanges[device.id]}
													<Button
														color="green"
														pill
														on:click={() => {
															saveChanges({ device: device });
														}}
													>
														<i class="fa-solid fa-save fa-lg me-2" />
														Update
													</Button>
												{:else}
													<Button color="green" pill class="self-end invisible">
														<i class="fa-solid fa-save fa-lg me-2" />
														Update
													</Button>
												{/if}
											</div>
										</div>
									</TableBodyCell>
								</TableBodyRow>
							{/if}
						{/each}
					</Table>
				</div>
				<div class="flex justify-end space-x-3 py-5">
					<Pagination.Root
						count={devices.length}
						perPage={itemsPerPage}
						let:pages
						let:currentPage
						bind:page={itemOffset}
						let:range
					>
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.PrevButton>
									<ChevronLeft class="h-4 w-4" />
									<span class="hidden sm:block">Previous</span>
								</Pagination.PrevButton>
							</Pagination.Item>
							{#each pages as page (page.key)}
								{#if page.type === 'ellipsis'}
									<Pagination.Item>
										<Pagination.Ellipsis />
									</Pagination.Item>
								{:else}
									<Pagination.Item>
										<Pagination.Link {page} isActive={currentPage === page.value}>
											{page.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.NextButton>
									<span class="hidden sm:block">Next</span>
									<ChevronRight class="h-4 w-4" />
								</Pagination.NextButton>
							</Pagination.Item>
						</Pagination.Content>
						<p class="text-center text-[13px]">
							Showing {range.start} - {range.end}
						</p>
					</Pagination.Root>
				</div>
			</div>
		</div>
	</div>
	<!-- style="width: {CANVAS_WIDTH}px; height: {CANVAS_HEIGHT}px" -->
	<div id="parent" class="col-span-2 mt-16">
		<div id="canvas" />
	</div>
</div>
