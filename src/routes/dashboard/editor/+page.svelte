<script lang="ts">
	import storePlan from '$lib/assets/store_plan.webp';
	// import yellowBeacon from '$lib/assets/yellowbeacon.png';
	import BeaconSvg from '$lib/assets/beacon.svg';
	import { onMount } from 'svelte';

	import type KonvaType from 'konva';

	import { notify } from '../../../components/notify';
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
		Range,
		Toggle,
		PaginationItem
	} from 'flowbite-svelte';

	type CampaignType = {
		id: number;
		name: string;
		description: string;
		beacons: CampaignBeaconType[];
		created: string;
		status: string;
		isCompleted: boolean;
	};

	type CampaignBeaconType = {
		id: number;
		name: string;
		position: {
			x: number;
			y: number;
		} | null;
		range: number;
		// status: string;
	};

	let items: CampaignType[] = [
		{
			id: 1,
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
					range: 10
					// status: 'active'
				},
				{
					id: 2,
					name: 'Beacon 2',
					position: {
						x: 200,
						y: 200
					},
					range: 2
					// status: 'active'
				},
				{
					id: 3,
					name: 'Beacon 3',
					position: {
						x: 300,
						y: 300
					},
					range: 1
					// status: 'active'
				}
			],
			created: '2021-09-01',
			status: 'active',
			isCompleted: true
		},
		{
			id: 2,
			name: 'Campaign 2',
			description: 'Campaign 2 description',
			beacons: [
				{
					id: 1,
					name: 'Beacon 1',
					position: null,
					range: 10
					// status: 'active'
				},
				{
					id: 2,
					name: 'Beacon 2',
					position: null,
					range: 10
					// status: 'active'
				},
				{
					id: 3,
					name: 'Beacon 3',
					position: null,
					range: 5
					// status: 'not-active'
				}
			],
			created: '2021-09-01',
			status: 'not-active',
			isCompleted: false
		},
		{
			id: 3,
			name: 'Campaign 3',
			description: 'Campaign 3 description',
			beacons: [
				{
					id: 1,
					name: 'Beacon 1',
					position: {
						x: 200,
						y: 51
					},
					range: 5
					// status: 'not-active'
				},
				{
					id: 2,
					name: 'Beacon 2',
					position: {
						x: 100,
						y: 150
					},
					range: 10
					// status: 'not-active'
				},
				{
					id: 3,
					name: 'Beacon 3',
					position: {
						x: 300,
						y: 300
					},
					range: 5
					// status: 'active'
				}
			],
			created: '2021-09-01',
			status: 'not-active',
			isCompleted: true
		}
	];

	let selectedRows: number[] = []; // = [0, 1, 2]
	let editRow: number;

	let selectedBeaconsForNewCampaign: any[] = [];
	let beaconsForNewCampaign: CampaignBeaconType[] = [];
	let newCampaignName: string = '';

	$: if (selectedBeaconsForNewCampaign.length != beaconsForNewCampaign.length) {
		beaconsForNewCampaign = selectedBeaconsForNewCampaign.map((beaconId) => {
			return {
				id: beaconId,
				name: `Beacon ${beaconId}`,
				position: null,
				range: MIN_RANGE_BEACON,
				status: 'not-active'
			};
		});
		console.log('beaconsForNewCampaign:', beaconsForNewCampaign);
	}

	let availableBeacons = [
		{ value: '1', name: 'Beacon 1', inUse: true },
		{ value: '2', name: 'Beacon 2', inUse: false },
		{ value: '3', name: 'Beacon 3', inUse: true },
		{ value: '4', name: 'Beacon 4', inUse: false },
		{ value: '5', name: 'Beacon 5', inUse: true }
	];

	const toggleCampaign = (i: any) => {
		isDraggable = false;
		// console.log('selectedRows:', selectedRows, ' i:', i);
		if (selectedRows?.includes(i)) {
			selectedRows = selectedRows.filter((row) => row !== i);
		} else {
			selectedRows = [...selectedRows, i];
		}
	};

	const toggleAllCampaigns = () => {
		isDraggable = false;
		if (selectedRows.length === items.length) {
			selectedRows = [];
		} else {
			selectedRows = items.map((_, i) => i);
		}
	};

	const closeAllCampaigns = () => {
		isDraggable = false;
		selectedRows = [];
	};

	let isNewCampaignModalOpen: boolean = false;

	let Konva: typeof KonvaType;
	let layer: KonvaType.Layer;
	let beaconLayer: KonvaType.Layer;
	let tooltipLayer: KonvaType.Layer;
	let tooltip: KonvaType.Label;
	let stage: KonvaType.Stage;
	let backgroundImage: KonvaType.Image;
	let rightSideContent: boolean = false;
	let rangeOpen: boolean = false;
	let range: number = 1;

	let isAddLocationToBeacon: boolean = false;
	let beaconToAddLocation: CampaignBeaconType | null = null;
	let isDraggable: boolean = false;

	const MIN_RANGE_BEACON = 1;
	const MAX_RANGE_BEACON = 15;
	const BEACON_RANGE_STEP = 1;

	const CANVAS_WIDTH = 500;
	const CANVAS_HEIGHT = 800;

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
			konvaBackgroundLayer.add(backgroundImage);
			konvaBackgroundLayer.moveToBottom();
			konvaBackgroundLayer.draw();
		};

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

	const BEACON_RADIUS = 15;
	const BEACON_AREA_RADIUS = 100;

	const BEACON_RANGE = 10;

	let beaconsMap: CampaignBeaconType[] = [];

	$: {
		updateMapDelete();
		if (beaconsMap.length > 0) {
			beaconsMap.forEach((beacon: CampaignBeaconType) => {
				addBeaconToMap(beacon, isDraggable);
			});
		}
	}

	$: items.forEach((item) => {
		item.beacons.forEach((beacon) => {
			if (beaconsMap.includes(beacon)) {
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
			if (!isDraggable && selectedRows && selectedRows.length > 0) {
				console.log('selectedRows:', selectedRows);
				selectedRows.forEach((row) => {
					if (items[row].beacons.length > 0) {
						items[row].beacons.forEach((beacon) => {
							addBeaconToMap(beacon);
						});
					}
				});
			}
		}
	}

	const addBeaconToMap = (beacon: CampaignBeaconType, draggable: boolean = false) => {
		// let pos = stage.getPointerPosition() || { x: 0, y: 0 };
		const pos = beacon.position;
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
		const beaconRange = beacon.range;
		Konva.Image.fromURL('/src/lib/assets/beacon.svg', function (beaconSvg) {
			const IMAGE_W = beaconSvg.getWidth() / 5;
			const IMAGE_H = beaconSvg.getHeight() / 5;
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
				radius: BEACON_RANGE * beaconRange,
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
					beacon.position = {
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
		if (!isAddLocationToBeacon || beaconToAddLocation == null) {
			return;
		}
		// console.log('event:', event);
		if (event.target == backgroundImage) {

			const beaconRange = beaconToAddLocation.range;
			const beaconName = beaconToAddLocation.name;

			
			let pos = stage.getPointerPosition() || { x: 0, y: 0 };
			console.log('pos:', pos);

			items.forEach((item) => {
				item.beacons.forEach((beacon) => {
					if (beacon.id == beaconToAddLocation?.id) {
						beacon.position = {
							x: pos.x,
							y: pos.y
						};
					}
				});
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
			beaconToAddLocation = null;
			isAddLocationToBeacon = false;
		}
	};

	const addRangeToBeacon = (beacon: CampaignBeaconType) => {
		if (!beacon.position) {
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
			if (!beacon.position) {
				return;
			}
			return circle.x() == beacon.position.x && circle.y() == beacon.position.y;
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
	}

	const addNewCampaign = () => {
		// console.log('newCampaignName:', newCampaignName);
		if (newCampaignName == '') {
			notify('Please enter a name for the new campaign', 'error');
			// alert('Please enter a name for the new campaign');
			return;
		}
		items = [
			...items,
			{
				id: items.length + 1,
				name: newCampaignName,
				description: 'Campaign 3 description',
				beacons: beaconsForNewCampaign,
				// created: Date.now(),
				created: '2021-09-01',
				status: 'not-active',
				isCompleted: false
			}
		];

		console.log('items:', items);

		newCampaignName = '';
		selectedBeaconsForNewCampaign = [];
		notify('New campaign added', 'success');
	};

	const removeBeaconFromCampaign = (campaignId: number, beaconId: number) => {
		console.log('removeBeaconFromCampaign campaignId:', campaignId, ' beaconId:', beaconId);
		items = items.map((item) => {
			if (item.id == campaignId) {
				item.beacons = item.beacons.filter((beacon: any) => beacon.id != beaconId);
			}
			return item;
		});
	};

	const addNewBeaconToCampaign = () => {
		console.log('addNewBeaconToCampaign');
	};

	const addNewLocationToBeacon = (beacon: CampaignBeaconType) => {
		console.log('addNewLocationToBeacon beacon:', beacon);
		closeAllCampaigns();
		isAddLocationToBeacon = true;
		beaconToAddLocation = beacon;
		updateMapDelete();
	};

	const saveChanges = async () => {
		console.log('items:', items);

		await fetch('/dashboard/editor', {
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

	const changeBeaconLocation = (beacon: CampaignBeaconType) => {
		// console.log('changeBeaconLocation beaconId:', beaconId, ' location:', location);
		// add beacon to map
		// beaconsMap.push(beacon);
		// beaconsMap.forEach((beaconFromMap) => {
		// 	// layer.find('Circle').forEach((circle: Konva.Circle) => {
		// 	// 	if (
		// 	// 		circle.x() == beaconFromMap.position?.x &&
		// 	// 		circle.y() == beaconFromMap.position?.y
		// 	// 	) {
		// 	// 		circle.destroy();
		// 	// 	}
		// 	// });

		// 	let beaconSvgs: KonvaType.Image[];
		// 	let beaconRanges: KonvaType.Circle[];
		// 	beaconSvgs = layer.find('Image');
		// 	beaconRanges = layer.find('Circle');

		// 	beaconSvgs.forEach((beaconSvg: KonvaType.Image) => {
		// 		if (
		// 			beaconSvg.x() == beaconFromMap.position?.x &&
		// 			beaconSvg.y() == beaconFromMap.position?.y
		// 		) {
		// 			beaconSvg.destroy();
		// 		}
		// 	});

		// 	beaconRanges.forEach((beaconRange: KonvaType.Circle) => {
		// 		if (
		// 			beaconRange.x() == beaconFromMap.position?.x &&
		// 			beaconRange.y() == beaconFromMap.position?.y
		// 		) {
		// 			beaconRange.destroy();
		// 		}
		// 	});

		// 	// beaconSvgs.forEach((beaconSvg: KonvaType.Image) => {
		// 	// 	if (
		// 	// 		beaconSvg.x() == beaconFromMap.position?.x &&
		// 	// 		beaconSvg.y() == beaconFromMap.position?.y
		// 	// 	) {
		// 	// 		beaconSvg.destroy();
		// 	// 	}
		// 	// });
		// });

		

		closeAllCampaigns();
		isDraggable = true;
		beaconsMap = [beacon];
	};

	const updateMapDelete = () => {
		// beaconsInMap: CampaignBeaconType[]
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

		// beaconsInMap.forEach((beaconFromMap) => {
		// 	// layer.find('Circle').forEach((circle: Konva.Circle) => {
		// 	// 	if (
		// 	// 		circle.x() == beaconFromMap.position?.x &&
		// 	// 		circle.y() == beaconFromMap.position?.y
		// 	// 	) {
		// 	// 		circle.destroy();
		// 	// 	}
		// 	// });

		// 	let beaconSvgs: KonvaType.Image[];
		// 	let beaconRanges: KonvaType.Circle[];
		// 	beaconSvgs = layer.find('Image');
		// 	beaconRanges = layer.find('Circle');

		// 	beaconSvgs.forEach((beaconSvg: KonvaType.Image) => {
		// 		// if (
		// 		// 	beaconSvg.x() != beaconFromMap.position?.x &&
		// 		// 	beaconSvg.y() != beaconFromMap.position?.y
		// 		// ) {
		// 		// 	beaconSvg.destroy();
		// 		// }
		// 		// else{
		// 		// 	const foundBeaconRange = beaconRanges.find((beaconRange: KonvaType.Circle) => {
		// 		// 		beaconRange.id() == beaconSvg.id();
		// 		// 	});
		// 		// }
		// 		beaconSvg.destroy();

		// 	});

		// 	beaconRanges.forEach((beaconRange: KonvaType.Circle) => {
		// 		// if (
		// 		// 	beaconRange.x() != beaconFromMap.position?.x &&
		// 		// 	beaconRange.y() != beaconFromMap.position?.y &&
		// 		// 	beaconRange.radius() != beaconFromMap.range
		// 		// ) {
		// 		// }
		// 		beaconRange.destroy();
		// 	});

		// 	// beaconSvgs.forEach((beaconSvg: KonvaType.Image) => {
		// 	// 	if (
		// 	// 		beaconSvg.x() == beaconFromMap.position?.x &&
		// 	// 		beaconSvg.y() == beaconFromMap.position?.y
		// 	// 	) {
		// 	// 		beaconSvg.destroy();
		// 	// 	}
		// 	// });
		// });
	};

	const previousTable = () => {
		alert('Previous btn clicked. Make a call to your server to fetch data.');
	};
	const nextTable = () => {
		alert('Next btn clicked. Make a call to your server to fetch data.');
	};
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

<div class="grid grid-cols-2 p-5 gap-5">
	<div class="flex flex-col gap-5">
		<div>
			<div class="flex flex-row justify-between items-center px-5 py-5 bg-slate-100">
				<p class="text-xl font-semibold text-gray-900 dark:text-white">Campaigns</p>
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
					<Button
						color="blue"
						pill
						on:click={() => {
							isNewCampaignModalOpen = true;
						}}
						type="submit"
					>
						<i class="fa-solid fa-plus fa-lg me-2" />
						New Campaign
					</Button>
				</div>
				<!-- </form> -->
			</div>
			<Table hoverable={true} shadow>
				<!-- <caption class="p-5 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
					Our products
					<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">Browse a list of Flowbite products designed to help you work and play, stay organized, get answers, keep in touch, grow your business, and more.</p>
				  </caption> -->
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
								toggleAllCampaigns();
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
						<TableBodyRow class={selectedRows?.includes(i) ? ' bg-gray-300' : 'bg-white'}>
							<!-- id = {item.id}
							on:click={(event) => {
								const getDocument = document.getElementById(item.id.toString());
								if (getDocument) {
									console.log('getDocument:', getDocument);
									console.log('event.target:', event.target);
									if (event.target != getDocument) {
										return;
									}
								}
								toggleRow(i);
							}} -->
							<TableBodyCell class="!p-4">
								<!-- <Checkbox checked={selectedRows.includes(i)} /> -->
								<label class="swap">
									<!-- this hidden checkbox controls the state -->
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

							<!-- <TableBodyCell>{item.beacons.length}</TableBodyCell> -->
							<TableBodyCell>
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
							</TableBodyCell>
						</TableBodyRow>
						{#if editRow === i}
							<TableBodyRow>
								<TableBodyCell colspan="6" class="p-3">
									<div class="flex flex-row justify-between items-center">
										<div class="mb-2">
											<Label for="campaign-name" class="block mb-2">Campaign Name</Label>
											<Input id="campaign-name" placeholder={item.name} bind:value={item.name} />
										</div>
										<div class="flex flex-row gap-2 items-center">
											<TableBodyCell>
												<Toggle
													color="green"
													checked={item.status == 'active'}
													bind:value={item.status}
													on:change={() => {
														if (item.status == 'active') {
															item.status = 'not-active';
														} else {
															item.status = 'active';
														}
													}}
												/>
											</TableBodyCell>
											<div>
												<Button color="blue" pill on:click={() => {}}>
													<i class="fa-solid fa-plus fa-lg me-2" />
													Add new beacon
												</Button>
											</div>
										</div>
									</div>
									<Table>
										<TableHead>
											<TableHeadCell>Beacon ID</TableHeadCell>
											<TableHeadCell>Name</TableHeadCell>
											<TableHeadCell>Range</TableHeadCell>
											<!-- <TableHeadCell>Status</TableHeadCell> -->
											<TableHeadCell />
											<TableHeadCell />
										</TableHead>
										{#each item.beacons as beacon, beacon_index}
											<TableBodyRow>
												<TableBodyCell>{beacon.id}</TableBodyCell>
												<TableBodyCell>{beacon.name}</TableBodyCell>
												<TableBodyCell>
													<Label>Range steps</Label>
													<Range
														id="table-beacon-range"
														min={MIN_RANGE_BEACON}
														max={MAX_RANGE_BEACON}
														bind:value={beacon.range}
														step={BEACON_RANGE_STEP}
													/>
													<p>Value: {beacon.range} meters</p>
												</TableBodyCell>
												<!-- <TableBodyCell>
													{#if beacon.status == 'active'}
														<Badge rounded color="green">Active</Badge>
													{:else}
														<Badge rounded color="red">Not-Active</Badge>
													{/if}
												</TableBodyCell> -->
												<!-- <TableBodyCell>
													<Toggle
														color="green"
														checked={beacon.status == 'active'}
														bind:value={beacon.status}
														on:change={() => {
															if (beacon.status == 'active') {
																beacon.status = 'not-active';
															} else {
																beacon.status = 'active';
															}
														}}
													/>
												</TableBodyCell> -->
												<TableBodyCell>
													{#if beacon.position != undefined}
														<div class="tooltip tooltip-top" data-tip="Change location">
															<Button
																color="blue"
																pill
																class="!p-2"
																on:click={() => {
																	changeBeaconLocation(beacon);
																}}
															>
																<!-- Change Location
															<i class="fa-solid fa-location-dot"></i> -->
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
																	addNewLocationToBeacon(beacon);
																}}
															>
																Add Location
															</Button>
														</div>
													{/if}
												</TableBodyCell>
												<TableBodyCell>
													<div class="tooltip tooltip-top" data-tip="Delete beacon">
														<Button
															color="red"
															pill
															class="!p-2"
															size="lg"
															on:click={() => {
																removeBeaconFromCampaign(item.id, beacon.id);
															}}
														>
															<!-- Remove -->
															<i class="fa-solid fa-trash" />
														</Button>
													</div>
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
				<PaginationItem large on:click={previousTable}>Previous</PaginationItem>
				<PaginationItem large on:click={nextTable}>Next</PaginationItem>
			</div>
		</div>
		<!-- <Button
			size="lg"
			color="alternative"
			pill
			on:click={() => {
				isNewCampaignModalOpen = true;
			}}
		>
			<i class="fa-solid fa-plus fa-xl me-2" />
			Create new campaign
		</Button> -->
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

<!-- <div
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
						<input
							type="range"
							min={MIN_RANGE_BEACON}
							max={MAX_RANGE_BEACON}
							class="range range-primary range-sm btn-wide"
							step={BEACON_RANGE_STEP}
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
</div> -->

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
					step={BEACON_RANGE_STEP}
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
	<div class="flex flex-col p-5" style="min-height: 400px">
		<div class="mb-6">
			<Label for="campaign-name" class="block mb-2">Campaign Name</Label>
			<Input id="campaign-name" placeholder="Campaign Name" bind:value={newCampaignName} />
		</div>

		<Label class="block mb-5">
			Select beacons for this campaign
			<MultiSelect items={availableBeacons} bind:value={selectedBeaconsForNewCampaign} />
		</Label>

		{#each beaconsForNewCampaign as selectedBeacon, selectedBeaconIndex}
			<div class="py-2">
				{selectedBeacon.name}
				<Label>Range steps</Label>
				<Range
					id="new-campaign-beacon-range"
					min={MIN_RANGE_BEACON}
					max={MAX_RANGE_BEACON}
					bind:value={selectedBeacon.range}
					step={BEACON_RANGE_STEP}
				/>
				<p>Range: {selectedBeacon.range} meters</p>
			</div>
		{/each}
	</div>

	<svelte:fragment slot="footer">
		<Button color="green" on:click={() => addNewCampaign()}>Create</Button>
		<Button color="alternative">Cancel</Button>
	</svelte:fragment>
</Modal>
