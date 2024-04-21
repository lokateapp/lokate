<script lang="ts">
	import { Calendar as CalendarIcon } from 'lucide-svelte';
	import { DateFormatter, type DateValue, getLocalTimeZone, today } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	export let value: DateValue | undefined;
	export let onClick: () => void;

	let open: boolean = false;

	const TODAY = today(getLocalTimeZone());

	const MIN_DATE = today(getLocalTimeZone()).set({
		year: TODAY.year - 1
	});
	const MAX_DATE = TODAY;

	// let value: DateValue | undefined = undefined;
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button
			variant="outline"
			class={cn('w-[280px] justify-start text-left font-normal', !value && 'text-muted-foreground')}
			builders={[builder]}
		>
			<CalendarIcon class="mr-2 h-4 w-4" />
			{value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar bind:value initialFocus bind:open {onClick} minValue={MIN_DATE} maxValue={MAX_DATE} />
	</Popover.Content>
</Popover.Root>
