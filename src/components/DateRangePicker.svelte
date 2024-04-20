<script lang="ts">
	import type { DateRange } from 'bits-ui';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Calendar } from 'lucide-svelte';

	import dayjs from 'dayjs';

	export let value: DateRange | undefined;
	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});
	let date1YearBefore = dayjs().subtract(1, 'year');
	const MIN_DATE = new CalendarDate(
		date1YearBefore.year(),
		date1YearBefore.month(),
		date1YearBefore.date()
	);
	const MAX_DATE = new CalendarDate(dayjs().year(), dayjs().month() + 1, dayjs().date());

	let startValue: DateValue | undefined = undefined;
</script>

<div class="">
	<Popover.Root openFocus>
		<Popover.Trigger asChild let:builder>
			<Button
				variant="outline"
				class={cn(
					'w-[300px] justify-start text-left font-normal',
					!value && 'text-muted-foreground'
				)}
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
				bind:value
				bind:startValue
				initialFocus
				numberOfMonths={1}
				placeholder={value?.start}
			/>
		</Popover.Content>
	</Popover.Root>
</div>
