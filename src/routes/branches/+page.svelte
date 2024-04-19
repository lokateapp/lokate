<script lang="ts">
	import { Button, Heading } from 'flowbite-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex flex-col p-5">
	<Heading tag="h3" class="">Branches</Heading>

	<div class="flex justify-center items-center mt-10">
		<Button
			color="blue"
			pill
			size="lg"
			on:click={() => {
				window.location.href = window.location.href + '/create-branch';
			}}
		>
			<i class="fa-solid fa-plus fa-lg me-2" />
			Create new branch
		</Button>
	</div>

	<div class="campaigns-grid">
		{#each data.branches as branch}
			<!-- <Button
			color="blue"
			pill
			size="lg"
			on:click={() => {
				window.location.href = window.location.href + `/edit-branch/${branch.id}`;
			}}
		>
			{branch.address}
		</Button> -->

			<a
				class="flex py-6 justify-center items-center mt-2 text-semibold text-xl border border-gray-200 rounded-lg shadow hover:bg-gray-100"
				href={`/dashboard/${branch.id}`}
			>
				<span class="text-ellipsis">{branch.address}</span>
			</a>
		{/each}
	</div>
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
