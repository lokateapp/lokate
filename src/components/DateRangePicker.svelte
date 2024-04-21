<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import { DateFormatter, type DateValue, getLocalTimeZone, today } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Calendar } from 'lucide-svelte';

	export let value: DateRange | undefined;
	export let onClick: () => void;
	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});
	const TODAY = today(getLocalTimeZone());

	const MIN_DATE = today(getLocalTimeZone()).set({
		year: TODAY.year - 1
	});
	const MAX_DATE = TODAY;

	let startValue: DateValue | undefined = undefined;

	let open: boolean = false;
</script>

<Popover.Root bind:open openFocus>
	<Popover.Trigger
		asChild
		let:builder
		on:click={(e) => {
			console.log('click', e);
		}}
	>
		<Button
			variant="outline"
			class={cn('w-[300px] justify-start text-left font-normal', !value && 'text-muted-foreground')}
			builders={[builder]}
		>
			<!-- <i class="fa-solid fa-calendar mr-2" /> -->
			<Calendar class="mr-2 h-4 w-4" />
			{#if value && value.start}
				{#if value.end}
					{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
						value.end.toDate(getLocalTimeZone())
					)}
				{:else}
					{df.format(value.start.toDate(getLocalTimeZone()))}
				{/if}
			{:else if startValue}
				{df.format(startValue.toDate(getLocalTimeZone()))}
			{:else}
				Pick a date
			{/if}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" align="start">
		<RangeCalendar
			minValue={MIN_DATE}
			maxValue={MAX_DATE}
			{onClick}
			bind:open
			bind:value
			bind:startValue
			initialFocus
			numberOfMonths={1}
			placeholder={value?.start}
		/>
	</Popover.Content>
</Popover.Root>
