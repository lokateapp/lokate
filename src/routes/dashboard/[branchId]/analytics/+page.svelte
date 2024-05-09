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
	import { getLocalTimeZone, today } from '@internationalized/date';
	import DateRangePicker from '$components/DateRangePicker.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import * as Pagination from '$lib/components/ui/pagination/index.js';

	const TODAY = today(getLocalTimeZone());
	let campaignDateRangeValue = {
		start: TODAY.set({ day: TODAY.day - 6 }),
		end: TODAY
	};

	$: width = window.innerWidth / 2;
	$: height = window.innerHeight / 2;

	window.addEventListener('resize', () => {
		width = window.innerWidth / 2;
		height = window.innerHeight / 2;
	});

	export let data: PageData;

	const { beaconsObject, campaignsObject, allCampaigns } = data;
	let events = data.events;

	let campaignsUsage: { id: string; date: Date; count: number }[] = [];
	let customersUsage: { date: Date; count: number }[] = [];
	let totalEventCount: number = 0;

	const getLast7Days = (givenDate: Date, length: number = 7) => {
		return Array.from({ length: length }, (_, i) => {
			const date = dayjs(givenDate).subtract(i, 'day');
			return {
				name: date.format('ddd, MMM D'),
				date: date.format('YYYY-MM-DD')
			};
		}).reverse();
	};

	let last7Days = getLast7Days(TODAY.toDate(getLocalTimeZone()));

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
		tooltip: {
			trigger: 'axis'
		},
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
		yAxis: {
			type: 'value'
		}
	};

	$: {
		if (allCampaigns.length > 0) {
			// console.log('allCampaigns : ', allCampaigns);
			option.legend = {
				data: [...allCampaigns.map((campaign) => campaign.name), 'Number of unique customers'],
				lineStyle: {
					width: 3
				}
			};
			option.series = [
				...allCampaigns.map((campaign) => {
					const filteredCampaigns = campaignsUsage.filter((usage) => usage.id === campaign.id);
					let processedData = filteredCampaigns.map((usage) => {
						return {
							date: dayjs(usage.date).format('YYYY-MM-DD'),
							count: usage.count
						};
					});
					return {
						name: campaign.name,
						data: last7Days.map((day) => {
							let data = processedData.find((usage) => usage.date === day.date);
							return data ? data.count : 0;
						}),
						...seriesStyle
					};
				}),
				{
					name: 'Number of unique customers',
					data: last7Days.map((day) => {
						let data = customersUsage.find(
							(usage) => dayjs(usage.date).format('YYYY-MM-DD') === day.date
						);
						return data ? data.count : 0;
					}),
					...seriesStyle
				}
			];
			option.xAxis = {
				type: 'category',
				boundaryGap: false,
				data: last7Days.map((day) => day.name)
			};
		}
	}
	async function fetchCampaignsUsage(from: Date | null = null, to: Date | null = null) {
		if (!from || !to) {
			from = TODAY.set({ day: TODAY.day - 6 }).toDate(getLocalTimeZone());
			to = TODAY.toDate(getLocalTimeZone());
		}
		from = dayjs(from).subtract(1, 'day').toDate();
		await fetch(`/api/analytics/campaigns?branchId=${$page.params.branchId}&from=${from}&to=${to}`)
			.then((res) => res.json())
			.then(({ campaignsUsage: data, customerUsage: data2 }) => {
				if (data) {
					campaignsUsage = data;
				}
				if (data2) {
					customersUsage = data2;
				}
			});
		const range = dayjs(to).diff(dayjs(from), 'day');
		last7Days = getLast7Days(to, range);
	}

	onMount(async () => {
		await fetchCampaignsUsage();
		await fetchEvents({ offset: 0 });
	});

	const onCampaignsUsageChange = async () => {
		if (campaignDateRangeValue.start && campaignDateRangeValue.end) {
			let from = campaignDateRangeValue.start?.toDate(getLocalTimeZone());
			let to = campaignDateRangeValue.end?.toDate(getLocalTimeZone());
			await fetchCampaignsUsage(from, to);
		}
	};

	const fetchEvents = async ({ offset = 0, limit = 10 }) => {
		// const test = $page.url.searchParams.get('offset');
		// console.log('test : ', test);
		await fetch(
			`/api/analytics/events?branchId=${$page.params.branchId}&offset=${offset}&limit=${limit}`
		)
			.then((res) => res.json())
			.then(({ selectedEvents, totalEventCount: count }) => {
				if (selectedEvents) {
					events = selectedEvents;
					totalEventCount = count;
				}
			});
	};

	// let offsetSearchParam = parseInt($page.url.searchParams.get('offset') || '0');

	let currentPage: number = 1;

	$: {
		fetchEvents({ offset: currentPage - 1 });
	}
</script>

<div class="flex flex-col gap-5 m-5">
	<div
		class="p-4 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800"
	>
		<div class="items-center justify-between mb-2 lg:flex">
			<div class="mb-4 lg:mb-0">
				<h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Events</h3>
			</div>
		</div>
		<Table hoverable={true} shadow>
			<TableHead>
				<TableHeadCell>Campaign Name</TableHeadCell>
				<TableHeadCell>Beacon Name</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
				<TableHeadCell>Customer Id</TableHeadCell>
				<TableHeadCell>Timestamp</TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y">
				{#each events as event}
					<TableBodyRow>
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
						<TableBodyCell>{event.customerId}</TableBodyCell>
						<TableBodyCell>{dayjs(event.enterTimestamp).format('llll')}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<div class="flex justify-end space-x-3 py-5">
			<Pagination.Root
				count={totalEventCount}
				perPage={10}
				let:pages
				let:currentPage
				bind:page={currentPage}
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
	<div class="grid gap-4 3xl:grid-cols-1 2xl:grid-cols-1">
		<div
			class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
		>
			<div class="items-center justify-between mb-2 lg:flex">
				<div class="mb-4 lg:mb-0">
					<h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Campaigns Performace</h3>
					<span class="text-base font-normal text-gray-500 dark:text-gray-400">
						Number of total events for each campaign in given date range
					</span>
				</div>
				<DateRangePicker bind:value={campaignDateRangeValue} onClick={onCampaignsUsageChange} />
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
