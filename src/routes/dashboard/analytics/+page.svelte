<script lang="ts">
	import type { PageData } from './$types';

	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import EChart from '../../../components/Chart.svelte';
	import type { EChartsOption, LineSeriesOption } from 'echarts';

	export let data: PageData;

	$: width = browser ? window.innerWidth / 2 : 600;
	$: height = browser ? window.innerHeight / 2 : 600;

	onMount(() => {
		window.addEventListener('resize', () => {
			width = browser ? window.innerWidth / 2 : 600;
			height = browser ? window.innerHeight / 2 : 600;
		});
	});

	var seriesStyle: LineSeriesOption;
	seriesStyle = {
		symbolSize: 10,
		lineStyle: {
			width: 3
		},
		stack: 'Total',
		type: 'line',
		smooth: true
	};

	var option: EChartsOption;
	option = {
		animation: true,
		title: {
			text: 'Campaigns Performance'
		},
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			// data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
			data: ['Campaign1', 'Campaign2', 'Campaign3', 'Campaign4', 'Campaign5'],

			lineStyle: {
				width: 3
			}
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
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		},
		yAxis: {
			type: 'value'
		},
		series: [
			{
				name: 'Campaign1',
				data: [120, 132, 101, 134, 90, 230, 210],
				...seriesStyle
			},
			{
				name: 'Campaign2',
				data: [220, 182, 191, 234, 290, 330, 310],
				...seriesStyle
			},
			{
				name: 'Campaign3',
				data: [150, 232, 201, 154, 190, 330, 410],
				...seriesStyle
			},
			{
				name: 'Campaign4',
				data: [320, 332, 301, 334, 390, 330, 320],
				...seriesStyle
			},
			{
				name: 'Campaign5',
				data: [820, 932, 901, 934, 1290, 1330, 1320],
				...seriesStyle
			}
		]
	};
</script>

<div class="">
	<div class="grid gap-4 3xl:grid-cols-1 2xl:grid-cols-1">
		<!-- Main widget -->
		<div
			class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
		>
			<div class="flex items-center justify-between mb-4">
				<div class="flex-shrink-0">
					<span class="text-xl font-bold leading-none text-gray-900 sm:text-2xl dark:text-white"
						>10,385</span
					>
					<h3 class="text-base font-light text-gray-500 dark:text-gray-400">
						Number of users this week
					</h3>
					<!-- <span class="text-xl font-bold leading-none text-gray-900 sm:text-2xl dark:text-white"
						>Heat Map</span
					> -->
				</div>
				<div
					class="flex items-center justify-end flex-1 text-base font-medium text-green-500 dark:text-green-400"
				>
					12.5%
					<svg
						class="w-5 h-5"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
			</div>
			<!-- <div id="main-chart"></div> -->
			<!-- <div bind:this={el} class="chart" id="chart" /> -->

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

			<!-- Card Footer -->
			<div
				class="flex items-center justify-between pt-3 mt-4 border-t border-gray-200 sm:pt-6 dark:border-gray-700"
			>
				<div>
					<button
						class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 rounded-lg hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
						type="button"
						data-dropdown-toggle="weekly-sales-dropdown"
						>Last 7 days <svg
							class="w-4 h-4 ml-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/></svg
						></button
					>
					<!-- Dropdown menu -->
					<div
						class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600"
						id="weekly-sales-dropdown"
					>
						<div class="px-4 py-3" role="none">
							<p class="text-sm font-medium text-gray-900 truncate dark:text-white" role="none">
								Filter by
							</p>
						</div>
						<ul class="py-1" role="none">
							<li>
								<a
									href="#"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem">Yesterday</a
								>
							</li>
							<li>
								<a
									href="#"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem">Today</a
								>
							</li>
							<li>
								<a
									href="#"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem">Last 7 days</a
								>
							</li>
							<li>
								<a
									href="#"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem">Last 30 days</a
								>
							</li>
							<li>
								<a
									href="#"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem">Last 90 days</a
								>
							</li>
						</ul>
						<div class="py-1" role="none">
							<a
								href="#"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
								role="menuitem">Custom...</a
							>
						</div>
					</div>
				</div>
				<div class="flex-shrink-0">
					<a
						href="#"
						class="inline-flex items-center p-2 text-xs font-medium uppercase rounded-lg text-primary-700 sm:text-sm hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
					>
						Sales Report
						<svg
							class="w-4 h-4 ml-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/></svg
						>
					</a>
				</div>
			</div>
		</div>
	</div>
	<div class="grid w-full grid-cols-1 gap-4 mt-4 xl:grid-cols-2 2xl:grid-cols-2">
		<div
			class="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
		>
			<div class="w-full">
				<h3 class="text-base font-normal text-gray-500 dark:text-gray-400">New campaigns</h3>
				<span class="text-2xl font-bold leading-none text-gray-900 sm:text-3xl dark:text-white"
					>6</span
				>
				<p class="flex items-center text-base font-normal text-gray-500 dark:text-gray-400">
					<span class="flex items-center mr-1.5 text-sm text-green-500 dark:text-green-400">
						<svg
							class="w-4 h-4"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								clip-rule="evenodd"
								fill-rule="evenodd"
								d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
							/>
						</svg>
						20%
					</span>
					Since last month
				</p>
			</div>
			<div class="w-full" id="new-products-chart" />
		</div>
		<div
			class="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
		>
			<div class="w-full">
				<h3 class="text-base font-normal text-gray-500 dark:text-gray-400">Users</h3>
				<span class="text-2xl font-bold leading-none text-gray-900 sm:text-3xl dark:text-white"
					>2,340</span
				>
				<p class="flex items-center text-base font-normal text-gray-500 dark:text-gray-400">
					<span class="flex items-center mr-1.5 text-sm text-green-500 dark:text-green-400">
						<svg
							class="w-4 h-4"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								clip-rule="evenodd"
								fill-rule="evenodd"
								d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
							/>
						</svg>
						3,4%
					</span>
					Since last month
				</p>
			</div>
			<div class="w-full" id="week-signups-chart" />
		</div>
	</div>

	<div
		class="p-4 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800"
	>
		<!-- Card header -->
		<div class="items-center justify-between lg:flex">
			<div class="mb-4 lg:mb-0">
				<h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Events</h3>
				<span class="text-base font-normal text-gray-500 dark:text-gray-400"
					>This is a list of latest events</span
				>
			</div>
			<div class="items-center sm:flex">
				<div class="flex items-center">
					<button
						id="dropdownDefault"
						data-dropdown-toggle="dropdown"
						class="mb-4 sm:mb-0 mr-4 inline-flex items-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						type="button"
					>
						Filter by status
						<svg
							class="w-4 h-4 ml-2"
							aria-hidden="true"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					<!-- Dropdown menu -->
					<div
						id="dropdown"
						class="z-10 hidden w-56 p-3 bg-white rounded-lg shadow dark:bg-gray-700"
					>
						<h6 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">Category</h6>
						<ul class="space-y-2 text-sm" aria-labelledby="dropdownDefault">
							<li class="flex items-center">
								<input
									id="apple"
									type="checkbox"
									value=""
									class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
								/>

								<label
									for="apple"
									class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
								>
									Completed (56)
								</label>
							</li>

							<li class="flex items-center">
								<input
									id="fitbit"
									type="checkbox"
									value=""
									checked
									class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
								/>

								<label
									for="fitbit"
									class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
								>
									Cancelled (56)
								</label>
							</li>

							<li class="flex items-center">
								<input
									id="dell"
									type="checkbox"
									value=""
									class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
								/>

								<label for="dell" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
									In progress (56)
								</label>
							</li>

							<li class="flex items-center">
								<input
									id="asus"
									type="checkbox"
									value=""
									checked
									class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
								/>

								<label for="asus" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
									In review (97)
								</label>
							</li>
						</ul>
					</div>
				</div>
				<div class="flex items-center space-x-4">
					<div class="relative">
						<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg
								class="w-5 h-5 text-gray-500 dark:text-gray-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8zM9.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V10zM10 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H10zM9.25 14a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V14zM12 9.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V10a.75.75 0 00-.75-.75H12zM11.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12zM12 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H12zM13.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75V10zM14 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H14z"
								/>
								<path
									clip-rule="evenodd"
									fill-rule="evenodd"
									d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
								/>
							</svg>
						</div>
						<input
							name="start"
							type="text"
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							placeholder="From"
						/>
					</div>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg
								class="w-5 h-5 text-gray-500 dark:text-gray-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8zM9.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V10zM10 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H10zM9.25 14a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V14zM12 9.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V10a.75.75 0 00-.75-.75H12zM11.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12zM12 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H12zM13.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75V10zM14 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H14z"
								/>
								<path
									clip-rule="evenodd"
									fill-rule="evenodd"
									d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
								/>
							</svg>
						</div>
						<input
							name="end"
							type="text"
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							placeholder="To"
						/>
					</div>
				</div>
			</div>
		</div>
		<!-- Table -->
		<div class="flex flex-col mt-6">
			<div class="overflow-x-auto rounded-lg">
				<div class="inline-block min-w-full align-middle">
					<div class="overflow-hidden shadow sm:rounded-lg">
						<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
							<thead class="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th
										scope="col"
										class="p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white"
									>
										User Id
									</th>
									<th
										scope="col"
										class="p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white"
									>
										User Name
									</th>
									<th
										scope="col"
										class="p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white"
									>
										Campaign Name
									</th>
									<th
										scope="col"
										class="p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white"
									>
										Enter Time
									</th>
									<th
										scope="col"
										class="p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white"
									>
										Exit Time
									</th>
									<th
										scope="col"
										class="p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white"
									>
										Status
									</th>
								</tr>
							</thead>
							<tbody class="bg-white dark:bg-gray-800">
								<tr>
									<td
										class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white"
									>
										2424
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Joseph Rodriguez
									</td>
									<td
										class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white"
									>
										Campaign 1
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Apr 23 ,2023 10:00 AM
									</td>
									<td
										class="inline-flex items-center p-4 space-x-2 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Apr 23 ,2023 10:05 AM
									</td>
									<td class="p-4 whitespace-nowrap">
										<span
											class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500"
											>Completed</span
										>
									</td>
								</tr>
								<tr class="bg-gray-50 dark:bg-gray-700">
									<td
										class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white"
									>
										2453
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										John Doe
									</td>
									<td
										class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white"
									>
										Campaign 2
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Apr 23 ,2023 9:05 AM
									</td>
									<td
										class="inline-flex items-center p-4 space-x-2 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Apr 23 ,2023 9:06 AM
									</td>
									<td class="p-4 whitespace-nowrap">
										<span
											class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500"
											>Completed</span
										>
									</td>
								</tr>
								<tr>
									<td
										class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white"
									>
										2453
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										John Doe
									</td>
									<td
										class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white"
									>
										Campaign 3
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Apr 23 ,2023 9:06 AM
									</td>
									<td
										class="inline-flex items-center p-4 space-x-2 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									/>
									<td class="p-4 whitespace-nowrap">
										<span
											class="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400"
											>Error</span
										>
									</td>
								</tr>
								<tr class="bg-gray-50 dark:bg-gray-700">
									<td
										class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white"
									>
										2463
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Joseph Mcfall
									</td>
									<td
										class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white"
									>
										Campaign 4
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Apr 24 ,2023 9:06 AM
									</td>
									<td
										class="inline-flex items-center p-4 space-x-2 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Apr 24 ,2023 9:16 AM
									</td>
									<td class="p-4 whitespace-nowrap">
										<span
											class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500"
											>Completed</span
										>
									</td>
								</tr>
								<tr>
									<td
										class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white"
									>
										2463
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Joseph Mcfall
									</td>
									<td
										class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white"
									>
										Campaign 1
									</td>
									<td
										class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										Apr 24 ,2023 9:20 AM
									</td>
									<td
										class="inline-flex items-center p-4 space-x-2 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
									>
										<!-- Apr 24 ,2023 9:30 AM -->
									</td>
									<td class="p-4 whitespace-nowrap">
										<span
											class="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md border border-purple-100 dark:bg-gray-700 dark:border-purple-500 dark:text-purple-400"
											>In progress</span
										>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
		<!-- Card Footer -->
		<div class="flex items-center justify-between pt-3 sm:pt-6">
			<div>
				<button
					class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 rounded-lg hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
					type="button"
					data-dropdown-toggle="transactions-dropdown"
					>Last 7 days <svg
						class="w-4 h-4 ml-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/></svg
					></button
				>
				<!-- Dropdown menu -->
				<div
					class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600"
					id="transactions-dropdown"
				>
					<div class="px-4 py-3" role="none">
						<p class="text-sm font-medium text-gray-900 truncate dark:text-white" role="none">
							Sep 16, 2021 - Sep 22, 2021
						</p>
					</div>
					<ul class="py-1" role="none">
						<li>
							<a
								href="#"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
								role="menuitem">Yesterday</a
							>
						</li>
						<li>
							<a
								href="#"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
								role="menuitem">Today</a
							>
						</li>
						<li>
							<a
								href="#"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
								role="menuitem">Last 7 days</a
							>
						</li>
						<li>
							<a
								href="#"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
								role="menuitem">Last 30 days</a
							>
						</li>
						<li>
							<a
								href="#"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
								role="menuitem">Last 90 days</a
							>
						</li>
					</ul>
					<div class="py-1" role="none">
						<a
							href="#"
							class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
							role="menuitem">Custom...</a
						>
					</div>
				</div>
			</div>
			<div class="flex-shrink-0">
				<a
					href="#"
					class="inline-flex items-center p-2 text-xs font-medium uppercase rounded-lg text-primary-700 sm:text-sm hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
				>
					Transactions Report
					<svg
						class="w-4 h-4 ml-1 sm:w-5 sm:h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/></svg
					>
				</a>
			</div>
		</div>
	</div>
</div>

<!-- 
<style>
	.background {
		fill: none;
		pointer-events: all;
	}
	#states {
		fill: #aaa;
	}
	#states .active {
		fill: orange;
	}
	#state-borders {
		fill: none;
		stroke: #fff;
		stroke-width: 1.5px;
		stroke-linejoin: round;
		stroke-linecap: round;
		pointer-events: none;
	}
</style> -->

<style>
	/* .chart :global(div) {
		font: 10px sans-serif;
		background-color: steelblue;
		text-align: right;
		padding: 3px;
		margin: 1px;
		color: white;
	} */
	:global(.chart) {
		width: 100%;
		min-width: 600px;
		max-width: 1200px;
	}

	.container {
		overflow-x: auto;
	}
</style>
