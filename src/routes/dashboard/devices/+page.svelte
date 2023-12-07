<script lang="ts">
	import {
		Label,
		Range,
		Table,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// let devices = data.devices;
	let devices = [
		{
			id: '1',
			name: 'Beacon 1',
			uid: '1234567',
			major: '100',
			minor: '10',
			charge: '100'
		},
		{
			id: '2',
			name: 'Beacon 2',
			uid: '1234568',
			major: '101',
			minor: '11',
			charge: '100'
		}
	];

	const MIN_RANGE_BEACON = 1;
	const MAX_RANGE_BEACON = 15;
</script>

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
		<Table shadow>
			<TableHead>
				<TableHeadCell />
				<TableHeadCell>Beacon ID</TableHeadCell>
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Device Uid</TableHeadCell>
				<TableHeadCell>Major</TableHeadCell>
				<!-- <TableHeadCell>Range</TableHeadCell> -->
				<TableHeadCell>Minor</TableHeadCell>
			</TableHead>
			{#each devices as device}
				<TableBodyRow>
					<TableBodyCell />
					<TableBodyCell>{device.id}</TableBodyCell>
					<TableBodyCell>{device.name}</TableBodyCell>
					<TableBodyCell>{device.major}</TableBodyCell>
					<TableBodyCell>{device.minor}</TableBodyCell>
					<TableBodyCell>{device.uid}</TableBodyCell>
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
			{/each}
		</Table>
	</div>
</div>
