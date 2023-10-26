<script lang="ts">
	import { campaigns } from '../../schema';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<form method="POST" action="?/createCampaign">
	<label>
		Campaign name
		<input name="name" type="text" />
	</label>
	<button>Create Campaign</button>
</form>

<div class="grid auto-rows-fr auto-cols-min grid-flow-col gap-3 mx-40">
	<a href="/campaigns/new">
		<div
			class="flex flex-col justify-center items-center p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100"
		>
			<div class="text-3xl font-bold">+</div>
			<span class="mb-2 text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap"
				>Create new campaign</span
			>
		</div>
	</a>

	{#each data.campaigns as campaign}
		<a href={`/campaign/${campaign.id}`}>
			<div
				class="relative flex flex-col justify-center items-center p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 h-full"
			>
				<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap">
					{campaign.id}
				</h5>
			</div>
		</a>
	{/each}
</div>
