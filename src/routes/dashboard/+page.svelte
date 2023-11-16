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

<div
	class="p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 w-[400px] m-auto"
>
	<a href="/campaigns/new">
		<div class="flex flex-col justify-center items-center bg-white">
			<div class="text-3xl font-bold">+</div>
			<span class="mb-2 text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap"
				>Create new campaign</span
			>
		</div>
	</a>
</div>

<div class="campaigns-grid">
	{#each data.campaigns as campaign}
		<div
			class="flex py-6 justify-center items-center mt-2 text-semibold text-xl border border-gray-200 rounded-lg shadow hover:bg-gray-100"
		>
			<a href={`/campaign/${campaign.id}`}>
				<span class="text-ellipsis">{campaign.id}</span>
			</a>
		</div>
	{/each}
</div>

<style>
	.campaigns-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: repeat(3, 1fr);
		margin-top: 4rem;
		margin-left: 2rem;
		margin-right: 2rem;
	}
</style>
