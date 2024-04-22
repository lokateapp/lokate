<script lang="ts">
	import { Button, Heading } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button as ShadButton } from '$lib/components/ui/button';

	export let data: PageData;
</script>

<div class="flex flex-col p-5 m-5 gap-10">
	<Heading tag="h3" class="">Branches</Heading>
	<div class="campaigns-grid">
		{#each data.branches as branch}
			<Card.Root>
				<Card.Header>
					<Card.Title>{branch.address}</Card.Title>
					<!-- <Card.Description>Address</Card.Description> -->
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-3">
						<div class="">
							<Label for="latitude">Latitude</Label>
							<Input
								type="number"
								disabled
								id="latitude"
								placeholder="Latitude"
								name="latitude"
								value={branch.latitude}
							/>
						</div>
						<div class="">
							<Label for="longitude">Longitude</Label>
							<Input
								type="number"
								disabled
								id="longitude"
								placeholder="Longitude"
								name="longitude"
								value={branch.longitude}
							/>
						</div>
					</div>
					<!-- <a
						class="flex py-6 justify-center items-center mt-2 text-semibold text-xl border border-gray-200 rounded-lg shadow hover:bg-gray-100"
						href={`/dashboard/${branch.id}`}
					>
						<span class="text-ellipsis">{branch.address}</span>
					</a> -->
				</Card.Content>
				<Card.Footer class="flex justify-end">
					<ShadButton
						class="rounded-lg"
						size="lg"
						on:click={() => {
							window.location.href = `/dashboard/${branch.id}`;
						}}
					>
						<i class="fa-solid fa-eye mr-2" />
						View
					</ShadButton>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
	<div class="flex justify-center items-center mt-10">
		<Button
			color="blue"
			size="lg"
			on:click={() => {
				window.location.href = window.location.href + '/create-branch';
			}}
		>
			<i class="fa-solid fa-plus fa-lg me-2" />
			Create new branch
		</Button>
	</div>
</div>

<style>
	.campaigns-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: repeat(3, 1fr);
	}
</style>
