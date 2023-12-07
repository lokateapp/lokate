<script lang="ts">
	import type { PageData } from './$types';

	import { Label, Range } from 'flowbite-svelte';

	const MIN_RANGE_BEACON = 1;
	const MAX_RANGE_BEACON = 15;

	export let data: PageData;

	let beaconRanges: Record<string, number> = {};
</script>

{#each data.beacons as beacon}
	<div>
		{beacon.id}

		<Label>Range steps</Label>
		<Range
			id="new-campaign-beacon-range"
			min={MIN_RANGE_BEACON}
			max={MAX_RANGE_BEACON}
			bind:value={beaconRanges[beacon.id]}
			step="0.5"
		/>
	</div>
{/each}
