<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex justify-center items-center mt-10">
	<button
		class="btn items-center"
		on:click={() => {
			window.location.href = window.location.href + `/create-campaign`;
		}}
	>
		<i class="fa-solid fa-plus fa-lg" />
		<span class="text-xl font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap"
			>Create new campaign</span
		>
		<!-- Create new campaign -->
		<!-- </a> -->
	</button>
</div>

<div class="campaigns-grid">
	{#each data.campaigns as campaign}
		<div
			class="flex py-6 justify-center items-center mt-2 text-semibold text-xl border border-gray-200 rounded-lg shadow hover:bg-gray-100"
		>
			<a href={window.location.href + `/campaign/${campaign.id}`}>
				<span class="text-ellipsis">{campaign.name}</span>
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
