<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
	import * as RangeCalendar from './index.js';
	import { cn } from '$lib/utils.js';
	import Button from '../button/button.svelte';

	type $$Props = RangeCalendarPrimitive.Props & {
		open: boolean;
		onClick: () => void;
	};
	type $$Events = RangeCalendarPrimitive.Events;

	export let value: $$Props['value'] = undefined;
	export let placeholder: $$Props['placeholder'] = undefined;
	export let weekdayFormat: $$Props['weekdayFormat'] = 'short';
	export let startValue: $$Props['startValue'] = undefined;
	export let open: boolean;
	export let onClick: any;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<RangeCalendarPrimitive.Root
	on:keydown
	bind:value
	bind:placeholder
	bind:startValue
	{weekdayFormat}
	class={cn('p-3', className)}
	{...$$restProps}
	let:months
	let:weekdays
>
	<RangeCalendar.Header>
		<RangeCalendar.PrevButton />
		<RangeCalendar.Heading />
		<RangeCalendar.NextButton />
	</RangeCalendar.Header>
	<RangeCalendar.Months>
		{#each months as month}
			<RangeCalendar.Grid>
				<RangeCalendar.GridHead>
					<RangeCalendar.GridRow class="flex">
						{#each weekdays as weekday}
							<RangeCalendar.HeadCell>
								{weekday.slice(0, 2)}
							</RangeCalendar.HeadCell>
						{/each}
					</RangeCalendar.GridRow>
				</RangeCalendar.GridHead>
				<RangeCalendar.GridBody>
					{#each month.weeks as weekDates}
						<RangeCalendar.GridRow class="mt-2 w-full">
							{#each weekDates as date}
								<RangeCalendar.Cell {date}>
									<RangeCalendar.Day {date} month={month.value} />
								</RangeCalendar.Cell>
							{/each}
						</RangeCalendar.GridRow>
					{/each}
				</RangeCalendar.GridBody>
			</RangeCalendar.Grid>
		{/each}
	</RangeCalendar.Months>
	<Button
		class="mt-3 w-full"
		variant="default"
		size="sm"
		on:click={() => {
			open = false;
			onClick();
		}}
	>
		Apply
	</Button>
</RangeCalendarPrimitive.Root>
