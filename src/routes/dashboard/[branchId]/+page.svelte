<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type KonvaType from 'konva';
	import dayjs from 'dayjs';
	import localizedFormat from 'dayjs/plugin/localizedFormat';
	dayjs.extend(localizedFormat);

	import { notify } from '$components/notify';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Modal,
		Button,
		Label,
		Input,
		MultiSelect,
		Badge,
		Toggle,
		ButtonGroup,
		Tooltip
	} from 'flowbite-svelte';
	import type { PageData } from './$types';
	import type { SelectBeaconWithFloorplan, SelectCampaignWithBeacons } from '$lib/schema';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	export let data: PageData;

	const {
		floorplan,
		availableBeacons,
		allCampaigns: campaigns,
		floorplanImgWidth,
		floorplanImgHeight
	} = data;

	// const SVG_URL =
	// 	'https://8nudshqewdlruco8.public.blob.vercel-storage.com/1713976455179_beacon-6H4OICwXNmAHIxkAW4iet0Pt4DIhUL.svg';
	// const SVG_URL = '/src/lib/assets/beacon.svg';
	const SVG_URL = '/static/assets/beacon.svg';

	let itemOffset = 1;
	let itemsPerPage = 6;
	// let items = campaigns;
	$: items = campaigns.slice(
		(itemOffset - 1) * itemsPerPage,
		(itemOffset - 1) * itemsPerPage + itemsPerPage
	);
	let selectedRows: number[] = []; // = [0, 1, 2]
	let editRow: number;

	let selectedBeaconsForNewCampaign: string[] = [];
	let newCampaignName: string = '';

	let isNewCampaignModalOpen: boolean = false;
	let popupDeleteCampaign: boolean = false;
	let popupDeleteCampaignData: { id: string; name: string } | null = null;

	let availableBeaconsForThisCampaign: any[] = [];
	let selectedBeaconsForThisCampaign: string[] = [];
	let popupAttachBeaconToCampaign: boolean = false;
	let popupAttachBeaconToCampaignData: { id: string; name: string } | null = null;

	let isUpdateCampaignName: { [key: string]: boolean } = {};

	const toggleCampaign = (i: any) => {
		// console.log('selectedRows:', selectedRows, ' i:', i);
		if (selectedRows?.includes(i)) {
			selectedRows = selectedRows.filter((row) => row !== i);
		} else {
			selectedRows = [...selectedRows, i];
		}
	};

	let Konva: typeof KonvaType;
	let layer: KonvaType.Layer;
	let rangeLayer: KonvaType.Layer;
	let tooltipLayer: KonvaType.Layer;
	let tooltip: KonvaType.Label;
	let stage: KonvaType.Stage;
	let backgroundImage: KonvaType.Image;

	let isAddLocationToBeacon: boolean = false;
	let beaconToAddLocation: SelectBeaconWithFloorplan | null = null;

	let CANVAS_WIDTH = floorplanImgWidth || 800;
	let CANVAS_HEIGHT = floorplanImgHeight || 600;
	let multiplier = 1;

	onMount(async () => {
		Konva = (await import('konva')).default;
		const parent = document.getElementById('parent')! as HTMLCanvasElement;
		// console.log('parent:', parent.clientWidth, parent.clientHeight);
		multiplier = parent.clientWidth / CANVAS_WIDTH;
		var konvaStage = new Konva.Stage({
			container: 'canvas',
			width: parent.clientWidth,
			height: CANVAS_HEIGHT * multiplier
		});
		stage = konvaStage;

		// then create layer
		var konvaLayer = new Konva.Layer();
		var konvaBackgroundLayer = new Konva.Layer();
		var konvaTooltipLayer = new Konva.Layer();
		var konvaRangeLayer = new Konva.Layer();

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
		}
		stage.on('pointerdown', addLocationToBeacon);

		stage.on('pointerenter', (event: any) => {
			stage.container().style.cursor = 'pointer';
		});

		stage.on('pointerleave', (event: any) => {
			stage.container().style.cursor = 'default';
		});

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

	const BEACON_RANGE = 2;

	let beaconsMap: SelectBeaconWithFloorplan[] = [];

	$: {
		updateMapDelete();
		if (beaconsMap.length > 0) {
			beaconsMap.forEach((beacon: SelectBeaconWithFloorplan) => {
				addBeaconToMap(beacon);
			});
		}
	}

	$: items.forEach((item) => {
		item.beacons.forEach(({ beacon }) => {
			if (beaconsMap.find((beaconMap) => beaconMap.id == beacon.id) == null) {
				beaconsMap = beaconsMap.map((beaconMap) => {
					if (beaconMap.id == beacon.id) {
						beaconMap = beacon;
					}
					return beaconMap;
				});
			}
		});
	});

	$: {
		if (layer) {
			updateMapDelete();
			if (selectedRows && selectedRows.length > 0) {
				selectedRows.forEach((row) => {
					if (items[row].beacons.length > 0) {
						items[row].beacons.forEach(({ beacon }) => {
							addBeaconToMap(beacon);
						});
					}
				});
			}
		}
	}

	const addBeaconToMap = (beacon: SelectBeaconWithFloorplan) => {
		// let pos = stage.getPointerPosition() || { x: 0, y: 0 };
		const pos = beacon.floorplan;
		const beaconName = beacon.name;
		if (!pos) {
			return;
		}

		const circles = layer.find('Circle');
		if (circles && circles.length > 0) {
			circles.forEach((circle) => {
				if (circle.x() == pos.x && circle.y() == pos.y) {
					circle.destroy();
					return;
				}
			});
		}
		const beaconRange = beacon.radius;
		Konva.Image.fromURL(SVG_URL, function (beaconSvg) {
			const IMAGE_W = beaconSvg.getWidth() / 10;
			const IMAGE_H = beaconSvg.getHeight() / 10;
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

			// add the shape to the layer
			// beaconSvg.on('pointerdblclick', removeBeacon);

			// mouseenter
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

			rangeLayer.add(circleRange);
			layer.add(beaconSvg);
			layer.draw();
		});
	};

	const addLocationToBeacon = (event: any) => {
		if (!isAddLocationToBeacon || beaconToAddLocation == null) {
			return;
		}
		// console.log('event:', event);
		if (event.target == backgroundImage) {
			const beaconRange = beaconToAddLocation.radius;
			const beaconName = beaconToAddLocation.name;

			let pos = stage.getPointerPosition() || { x: 0, y: 0 };
			// console.log('pos:', pos);

			items.forEach((item) => {
				item.beacons.forEach(({ beacon }) => {
					if (beacon.id == beaconToAddLocation?.id && beacon.floorplan != null) {
						beacon.floorplan = {
							...beacon.floorplan,
							x: pos.x,
							y: pos.y
						};
					}
				});
			});
			Konva.Image.fromURL(SVG_URL, function (beacon) {
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
					radius: beaconRange * BEACON_RANGE,
					stroke: 'red',
					strokeWidth: 1,
					fill: 'red',
					opacity: 0.2
				});

				// add the shape to the layer
				// beacon.on('pointerdblclick', removeBeacon);

				beacon.on('pointerclick', (event: any) => {
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

				rangeLayer.add(circleRange);
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
			beaconToAddLocation = null;
			isAddLocationToBeacon = false;
		}
	};

	const addNewCampaign = async () => {
		if (newCampaignName == '') {
			notify('Please enter a name for the new campaign', 'error');
			return;
		}
		await fetch('/api/campaigns/add-new-campaign', {
			method: 'POST',
			body: JSON.stringify({
				name: newCampaignName,
				beaconsId: selectedBeaconsForNewCampaign,
				branchId: $page.params.branchId
			}),
			headers: {
				'content-type': 'application/json'
			}
		})
			.then((res) => {
				if (res.status === 200) {
					notify(`New campaign ${newCampaignName} added`, 'success');
				} else {
					notify('Error adding new campaign', 'error');
				}
				return res.json();
			})
			.then(({ newCampaign }: { newCampaign: SelectCampaignWithBeacons }) => {
				// console.log('data:', newCampaign);
				items = [
					...items,
					{
						...newCampaign
					}
				];
			});
		newCampaignName = '';
		selectedBeaconsForNewCampaign = [];
	};

	const attachBeaconsToCampaign = async () => {
		if (popupAttachBeaconToCampaignData == null) {
			return;
		}
		if (selectedBeaconsForThisCampaign.length == 0) {
			notify('Please select beacons to attach to the campaign', 'error');
			return;
		}
		await fetch('/api/campaigns/attach-beacons', {
			method: 'POST',
			body: JSON.stringify({
				campaignId: popupAttachBeaconToCampaignData.id,
				beaconsId: selectedBeaconsForThisCampaign
				// branchId: $page.params.branchId
			}),
			headers: {
				'content-type': 'application/json'
			}
		})
			.then((res) => {
				if (res.status === 200) {
					notify(
						`Beacon(s) attached to campaign ${popupAttachBeaconToCampaignData?.name}`,
						'success'
					);
				} else {
					notify('Error attaching beacons to campaign', 'error');
				}
				return res.json();
			})
			.then(({ updatedCampaign }: { updatedCampaign: SelectCampaignWithBeacons }) => {
				// console.log('updatedCampaign:', updatedCampaign);
				items = items.map((item) => {
					if (item.id == updatedCampaign.id) {
						item = updatedCampaign;
					}
					return item;
				});
			});
		popupAttachBeaconToCampaignData = null;
		selectedBeaconsForThisCampaign = [];
	};

	const deleteCampaign = async ({ id, name }: { id: string; name: string }) => {
		await fetch('/api/campaigns/delete-campaign', {
			method: 'POST',
			body: JSON.stringify({
				id: id
			}),
			headers: {
				'content-type': 'application/json'
			}
		}).then((res) => {
			if (res.status === 200) {
				items = items.filter((item) => item.id != id);
				notify(`Campaign ${name} deleted`, 'success');
			} else {
				notify('Error deleting campaign', 'error');
			}
		});
	};

	const detachBeaconFromCampaign = async ({
		beaconId,
		beaconName,
		campaignId,
		campaignName
	}: {
		beaconId: string;
		beaconName: string;
		campaignId: string;
		campaignName: string;
	}) => {
		await fetch('/api/campaigns/detach-beacon', {
			method: 'POST',
			body: JSON.stringify({
				beaconId: beaconId,
				campaignId: campaignId
			}),
			headers: {
				'content-type': 'application/json'
			}
		}).then((res) => {
			if (res.status === 200) {
				items = items.map((item) => {
					if (item.id == campaignId) {
						item.beacons = item.beacons.filter(({ beacon }) => beacon.id != beaconId);
					}
					return item;
				});
				notify(`Beacon ${beaconName} detached from campaign ${campaignName}`, 'success');
			} else {
				notify('Error detaching beacon from campaign', 'error');
			}
		});
	};

	const updateCampaignStatus = async ({ item }: { item: SelectCampaignWithBeacons }) => {
		let isActive = item.status == 'active';
		return await fetch('/api/campaigns/campaign-status', {
			method: 'POST',
			body: JSON.stringify({
				id: item.id,
				status: isActive ? 'inactive' : 'active'
			}),
			headers: {
				'content-type': 'application/json'
			}
		});
	};

	const updateCampaignName = async ({ item }: { item: SelectCampaignWithBeacons }) => {
		await fetch('/api/campaigns/update-name', {
			method: 'POST',
			body: JSON.stringify({
				id: item.id,
				name: item.name
			}),
			headers: {
				'content-type': 'application/json'
			}
		}).then((res) => {
			if (res.status === 200) {
				notify(`Campaign name updated to ${item.name}`, 'success');
			} else {
				notify('Error updating campaign name', 'error');
			}
		});
	};

	const updateMapDelete = () => {
		// beaconsInMap: CampaignBeaconType[]
		// console.log('updateMapDelete');
		if (!layer) {
			return;
		}

		let beaconSvgs: KonvaType.Image[];
		let beaconRanges: KonvaType.Circle[];

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

<div class="grid grid-cols-2 p-5 gap-5">
	<div class="flex flex-col gap-10">
		<div class="flex flex-row justify-between">
			<h1 class="text-3xl font-semibold text-gray-800">Campaigns</h1>
		</div>
		<div>
			<div class="flex flex-row justify-end items-center px-5 py-5 bg-slate-100">
				<div>
					<Button
						color="blue"
						pill
						on:click={() => {
							isNewCampaignModalOpen = true;
						}}
					>
						<i class="fa-solid fa-plus fa-lg me-2" />
						New Campaign
					</Button>
				</div>
			</div>
			<Table hoverable={true} shadow>
				<TableHead>
					<TableBodyCell class="!p-4" />
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
						<TableBodyRow class={selectedRows?.includes(i) ? ' bg-gray-300' : 'bg-white'}>
							<TableBodyCell class="!p-4">
								<label class="swap">
									<input
										type="checkbox"
										class="hidden"
										checked={selectedRows.includes(i)}
										on:change={() => {
											toggleCampaign(i);
										}}
									/>

									<i class="swap-on fa-solid fa-eye fa-xl" />
									<i class="swap-off fa-solid fa-eye-slash fa-xl" />
								</label>
							</TableBodyCell>
							<TableBodyCell>{item.name}</TableBodyCell>
							<TableBodyCell>
								{item.beacons.length}
							</TableBodyCell>
							<TableBodyCell>{dayjs(item.createdAt).format('ll')}</TableBodyCell>
							<TableBodyCell>
								{#if item.status == 'active'}
									<Badge rounded color="green">Active</Badge>
								{:else}
									<Badge rounded color="red">Inactive</Badge>
								{/if}

								{#if !item.beacons.every(({ beacon }) => beacon.floorplan)}
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
										// console.log('Edit');
										if (editRow === i) {
											editRow = -1;
										} else {
											editRow = i;
										}
									}}>Edit</Button
								>
							</TableBodyCell>
						</TableBodyRow>
						{#if editRow === i}
							<TableBodyRow>
								<TableBodyCell colspan="6" class="p-3">
									<div class="flex flex-row justify-between items-end pb-2">
										<div class="flex flex-row gap-2">
											<div class="flex-col">
												<Label for="campaign-name" class="">Campaign Name</Label>
												<Input
													id="campaign-name"
													placeholder={item.name}
													bind:value={item.name}
													on:input={() => {
														isUpdateCampaignName[item.id] = true;
													}}
												/>
											</div>
											{#if isUpdateCampaignName[item.id]}
												<Button
													color="green"
													pill
													class="self-end"
													on:click={() => {
														isUpdateCampaignName[item.id] = false;
														updateCampaignName({ item: item });
													}}>Update</Button
												>
											{:else}
												<Button color="green" pill class="self-end invisible">Save</Button>
											{/if}
										</div>
										<Toggle
											on:change={async () => {
												await updateCampaignStatus({ item: item }).then((res) => {
													if (res.status === 200) {
														item.status = item.status == 'active' ? 'inactive' : 'active';
														notify(
															item.status != 'active'
																? 'Campaign deactivated'
																: 'Campaign activated',
															'success'
														);
													} else {
														notify('Error updating campaign status', 'error');
													}
												});
											}}
											color="green"
											size="large"
											checked={item.status == 'active'}
											bind:value={item.status}
										/>
										<ButtonGroup>
											<Button
												pill
												color="red"
												on:click={() => {
													popupDeleteCampaign = true;
													popupDeleteCampaignData = {
														id: item.id,
														name: item.name
													};
												}}
											>
												<!-- <i class="fa-solid fa-trash me-2" /> -->
												Delete campaign
											</Button>
											<Button
												color="blue"
												pill
												on:click={() => {
													popupAttachBeaconToCampaign = true;
													popupAttachBeaconToCampaignData = {
														id: item.id,
														name: item.name
													};
													availableBeaconsForThisCampaign = availableBeacons.filter(
														(availableBeacon) => {
															return !item.beacons.find(
																({ beacon }) => beacon.id == availableBeacon.id
															);
														}
													);
												}}
											>
												<!-- <i class="fa-solid fa-plus me-2" /> -->
												Attach new beacon(s)
											</Button>
										</ButtonGroup>
									</div>

									<Table>
										<TableHead>
											<TableHeadCell>Beacon ID</TableHeadCell>
											<TableHeadCell>Name</TableHeadCell>
											<TableHeadCell>Range</TableHeadCell>
											<TableHeadCell />
										</TableHead>
										{#each item.beacons as { beacon }}
											<TableBodyRow>
												<TableBodyCell>{beacon.id}</TableBodyCell>
												<TableBodyCell>{beacon.name}</TableBodyCell>
												<TableBodyCell>{beacon.radius} meters</TableBodyCell>
												<TableBodyCell>
													<Button
														color="primary"
														pill
														class="!p-2"
														size="lg"
														on:click={() => {
															detachBeaconFromCampaign({
																beaconId: beacon.id,
																beaconName: beacon.name || '',
																campaignId: item.id,
																campaignName: item.name
															});
														}}
													>
														<i class="fa-solid fa-link-slash" />
													</Button>
													<Tooltip>Detach the beacon from the campaign</Tooltip>
												</TableBodyCell>
											</TableBodyRow>
										{/each}
									</Table>
								</TableBodyCell>
							</TableBodyRow>
						{/if}
					{/each}
				</TableBody>
			</Table>
			<div class="flex justify-end space-x-3 py-5">
				<Pagination.Root
					count={campaigns.length}
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
	<div class="h-full w-full mt-16" id="parent">
		<div id="canvas" />
	</div>
</div>

<Modal
	title="Create a new campaign"
	bind:open={isNewCampaignModalOpen}
	size="lg"
	autoclose
	outsideclose
>
	<div class="flex flex-col p-5" style="min-height: 400px">
		<div class="mb-6">
			<Label for="campaign-name" class="block mb-2">Campaign Name</Label>
			<Input id="campaign-name" placeholder="Campaign Name" bind:value={newCampaignName} />
		</div>

		<Label class="block mb-5">
			Select beacons for this campaign
			<MultiSelect
				items={availableBeacons.map((beacon) => {
					return {
						value: beacon.id,
						name: beacon.name ? beacon.name : `Beacon ${beacon.id}`
					};
				})}
				bind:value={selectedBeaconsForNewCampaign}
			/>
		</Label>
	</div>

	<svelte:fragment slot="footer">
		<Button color="green" on:click={async () => await addNewCampaign()}>Create</Button>
		<Button color="alternative">Cancel</Button>
	</svelte:fragment>
</Modal>

<Modal
	title="Attach a beacon to the campaign"
	bind:open={popupAttachBeaconToCampaign}
	size="lg"
	autoclose
	outsideclose
>
	<div class="flex flex-col p-5" style="min-height: 400px">
		<Label class="block mb-5">
			Select beacons for campaign <strong>{popupAttachBeaconToCampaignData?.name}</strong>
			<MultiSelect
				items={availableBeaconsForThisCampaign.map((beacon) => {
					return {
						value: beacon.id,
						name: beacon.name ? beacon.name : `Beacon ${beacon.id}`
					};
				})}
				bind:value={selectedBeaconsForThisCampaign}
			/>
		</Label>
	</div>

	<svelte:fragment slot="footer">
		<Button color="green" on:click={async () => await attachBeaconsToCampaign()}
			>Attach beacon(s)</Button
		>
		<Button color="alternative">Cancel</Button>
	</svelte:fragment>
</Modal>

<Modal bind:open={popupDeleteCampaign} size="sm" autoclose>
	<div class="text-center">
		<!-- <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" /> -->
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Are you sure you want to delete the campaign <strong>{popupDeleteCampaignData?.name}</strong>?
		</h3>
		<Button
			color="red"
			class="me-2"
			on:click={async () => {
				popupDeleteCampaign = false;
				await deleteCampaign(popupDeleteCampaignData || { id: '', name: '' });
			}}
		>
			Yes, delete</Button
		>
		<Button color="alternative">Cancel</Button>
	</div>
</Modal>
