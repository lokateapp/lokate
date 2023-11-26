<script lang="ts">
	// import {d3} from
	// import { onMount } from 'svelte';
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';

	export let id: any;
	export let theme: any;
	export let width = 200;
	export let height = 200;

	export let option: echarts.EChartsOption | echarts.EChartsCoreOption;
	export let notMerge = false;
	export let lazyUpdate = false;

	let chart: echarts.ECharts; // our chart instance

	const setOption = () => {
		if (chart && !chart.isDisposed()) {
			chart.setOption(option, notMerge, lazyUpdate);
		}
	};

	const destroyChart = () => {
		if (chart && !chart.isDisposed()) {
			chart.dispose();
		}
	};

	const makeChart = () => {
		destroyChart();
		chart = echarts.init(document.getElementById(id), theme);
	};

	onMount(() => {
		makeChart();
	});

	onDestroy(() => {
		destroyChart();
	});

	let timeoutId: any;
	const handleResize = () => {
		if (timeoutId == undefined) {
			timeoutId = setTimeout(() => {
				if (chart && !chart.isDisposed()) {
					chart.resize();
				}
				timeoutId = undefined;
			}, 500);
		}
	};

	$: width && handleResize();
	$: option && setOption();
	$: if (chart && theme) {
		makeChart();
		setOption();
	}
</script>

<div bind:clientWidth={width}>
	<div {id} style="height: {height}px" />
</div>


<!-- D3 Charts -->
<!-- import * as d3 from 'd3';
import data from './volcano.json';
const n = data.width;
const m = data.height;
const width = 928;
const height = Math.round((m / n) * width);
const path = d3.geoPath().projection(d3.geoIdentity().scale(width / n));
const contours = d3.contours().size([n, m]);
const color = d3.scaleSequential(d3.interpolateTurbo).domain(d3.extent(data.values)).nice();

let el: HTMLDivElement;
onMount(() => {
    d3
        // .select(el)
        .select('#chart')
        .append('svg')
        // .selectAll("div")
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto;')
        .append('g')
        .attr('stroke', 'black')
        .selectAll()
        .data(color.ticks(20))
        .join('path')
        .attr('d', (d) => path(contours.contour(data.values, d)))
        .attr('fill', color);
}); -->