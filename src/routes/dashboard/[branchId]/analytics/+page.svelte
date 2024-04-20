<script lang="ts">
	import type { PageData } from './$types';
	import EChart from '$components/Chart.svelte';
	import type { EChartsOption, LineSeriesOption } from 'echarts';
	import {
		Badge,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import dayjs from 'dayjs';
	import localizedFormat from 'dayjs/plugin/localizedFormat';
	dayjs.extend(localizedFormat);
	import { EventStatus } from '$lib/schema';
	// import type { DateRange } from 'bits-ui';
	import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
	import DateRangePicker from '$components/DateRangePicker.svelte';

	const date6DaysBefore = dayjs().subtract(6, 'day');
	const today = dayjs();
	var campaignDateRangeValue = {
		start: new CalendarDate(
			date6DaysBefore.year(),
			date6DaysBefore.month() + 1,
			date6DaysBefore.date()
		),
		end: new CalendarDate(today.year(), today.month() + 1, today.date())
	};

	var eventDateRangeValue = {
		start: new CalendarDate(
			date6DaysBefore.year(),
			date6DaysBefore.month() + 1,
			date6DaysBefore.date()
		),
		end: new CalendarDate(today.year(), today.month() + 1, today.date())
	};

	export let data: PageData;

	$: width = window.innerWidth / 2;
	$: height = window.innerHeight / 2;

	window.addEventListener('resize', () => {
		width = window.innerWidth / 2;
		height = window.innerHeight / 2;
	});

	const { events, beaconsObject, campaignsObject, allCampaigns, campaignsUsage, customersUsage } =
		data;

	const last7DaysNames = Array.from({ length: 7 }, (_, i) => {
		const date = today.subtract(i, 'day');
		return {
			name: date.format('ddd D'),
			date: date.format('YYYY-MM-DD')
		};
	}).reverse();

	// $: if (eventDateRangeValue && eventDateRangeValue.end && eventDateRangeValue.start) {
	// 	console.log('eventDateRangeValue : ', eventDateRangeValue);
	// }

	const seriesStyle: LineSeriesOption = {
		symbolSize: 10,
		lineStyle: {
			width: 3
		},
		type: 'line',
		smooth: true
	};

	let option: EChartsOption = {
		animation: true,
		// title: {
		// 	text: 'Campaigns Performance'
		// },
		tooltip: {
			trigger: 'axis'
		},
		// legend: {
		// 	data: ['Campaign1', 'Campaign2', 'Campaign3', 'Campaign4', 'Campaign5'],
		// 	lineStyle: {
		// 		width: 3
		// 	}
		// },
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		toolbox: {
			feature: {
				saveAsImage: {},
				dataZoom: {
					yAxisIndex: 'none'
				}
			}
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: last7DaysNames.map((day) => day.name)
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				formatter: '{value}',
				color: '#6c757d',
				fontSize: 12,
				show: true
			}
		}
		// series: [
		// 	{
		// 		name: 'Campaign1',
		// 		data: [120, 132, 101, 134, 90, 230, 210],
		// 		...seriesStyle
		// 	},
		// 	{
		// 		name: 'Campaign2',
		// 		data: [220, 182, 191, 234, 290, 330, 310],
		// 		...seriesStyle
		// 	},
		// 	{
		// 		name: 'Campaign3',
		// 		data: [150, 232, 201, 154, 190, 330, 410],
		// 		...seriesStyle
		// 	},
		// 	{
		// 		name: 'Campaign4',
		// 		data: [320, 332, 301, 334, 390, 330, 320],
		// 		...seriesStyle
		// 	},
		// 	{
		// 		name: 'Campaign5',
		// 		data: [820, 932, 901, 934, 1290, 1330, 1320],
		// 		...seriesStyle
		// 	}
		// ]
	};

	$: if (allCampaigns.length > 0) {
		// console.log('allCampaigns : ', allCampaigns);
		option.legend = {
			data: [...allCampaigns.map((campaign) => campaign.name), 'Number of unique customers'],
			lineStyle: {
				width: 3
			}
		};
		option.series = [
			...allCampaigns.map((campaign) => {
				let filteredCampaigns = campaignsUsage.filter((usage) => usage.id === campaign.id);
				let processedData = filteredCampaigns.map((usage) => {
					return {
						date: dayjs(usage.date).format('YYYY-MM-DD'),
						count: usage.count
					};
				});
				return {
					name: campaign.name,
					data: last7DaysNames.map((day) => {
						let data = processedData.find((usage) => usage.date === day.date);
						return data ? data.count : 0;
					}),
					...seriesStyle
				};
			}),
			{
				name: 'Number of unique customers',
				data: last7DaysNames.map((day) => {
					let data = customersUsage.find(
						(usage) => dayjs(usage.date).format('YYYY-MM-DD') === day.date
					);
					return data ? data.count : 0;
				}),
				...seriesStyle
			}
		];
	}
</script>

<div class="flex flex-col gap-5 m-5">
	<div
		class="p-4 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800"
	>
		<div class="items-center justify-between mb-2 lg:flex">
			<div class="mb-4 lg:mb-0">
				<h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Events</h3>
				<span class="text-base font-normal text-gray-500 dark:text-gray-400">Latest 10 events</span>
			</div>
			<DateRangePicker bind:value={eventDateRangeValue} />
			<!-- <p>
				{#if eventDateRangeValue}
					{dayjs(eventDateRangeValue.start?.toDate(getLocalTimeZone())).format('ll')} -{' '}
					{dayjs(eventDateRangeValue.end?.toDate(getLocalTimeZone())).format('ll')}
				{:else}
					All time
				{/if}
			</p> -->
		</div>
		<Table hoverable={true} shadow>
			<TableHead>
				<TableHeadCell>Event Id</TableHeadCell>
				<TableHeadCell>Campaign Name</TableHeadCell>
				<TableHeadCell>Beacon Name</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
				<TableHeadCell>Enter Timestamp</TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y">
				{#each events as event}
					<TableBodyRow>
						<TableBodyCell class="!p-4">
							{event.id}
						</TableBodyCell>
						<TableBodyCell>
							{campaignsObject[event.campaignId]}
						</TableBodyCell>
						<TableBodyCell>{beaconsObject[event.beaconId]}</TableBodyCell>
						<TableBodyCell>
							{#if event.status == EventStatus.ENTER}
								<Badge rounded color="green">Enter</Badge>
							{:else if event.status == EventStatus.STAY}
								<Badge rounded color="indigo">Stay</Badge>
							{:else}
								<Badge rounded color="red">Exit</Badge>
							{/if}
						</TableBodyCell>
						<TableBodyCell>{dayjs(event.enterTimestamp).format('llll')}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</div>
	<div class="grid gap-4 3xl:grid-cols-1 2xl:grid-cols-1">
		<div
			class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
		>
			<div class="items-center justify-between mb-2 lg:flex">
				<div class="mb-4 lg:mb-0">
					<h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Campaigns</h3>
					<span class="text-base font-normal text-gray-500 dark:text-gray-400">
						Campaigns performance
					</span>
				</div>
				<DateRangePicker bind:value={campaignDateRangeValue} />
			</div>
			<div>
				<EChart
					id="main-chart"
					theme="light"
					bind:width
					bind:height
					{option}
					notMerge={true}
					lazyUpdate={true}
				/>
			</div>
		</div>
	</div>
</div>
