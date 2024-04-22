<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Fileupload, Helper } from 'flowbite-svelte';
</script>

<form method="POST" enctype="multipart/form-data" action="?/createBranch">
	<div class="flex flex-col justify-center items-center mt-10 gap-10">
		<h1 class="text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap">
			Create new branch
		</h1>
		<div class="form-control w-full max-w-sm gap-5">
			<div class="">
				<Label for="address">Address</Label>
				<Input type="text" id="address" placeholder="Address" name="address" />
			</div>
			<div class="">
				<Label for="latitude">Latitude</Label>
				<Input type="number" id="latitude" placeholder="Latitude" name="latitude" />
			</div>
			<div class="">
				<Label for="longitude">Longitude</Label>
				<Input type="number" id="longitude" placeholder="Longitude" name="longitude" />
			</div>
			<div>
				<Label for="floorplan" class="pb-2">Upload Floorplan</Label>
				<Fileupload id="floorplan" class="mb-2" name="floorplan" />
				<Helper>PNG or JPG.</Helper>
			</div>
			<div class="">
				<Label for="width">Width (meters)</Label>
				<Input type="number" id="width" placeholder="Width" name="width" />
				<Helper>Width of the floorplan in meters.</Helper>
			</div>
			<div class="">
				<Label for="height">Height (meters)</Label>
				<Input type="number" id="height" placeholder="Height" name="height" />
				<Helper>Height of the floorplan in meters.</Helper>
			</div>
		</div>
		<Button type="submit" class="rounded-full" size="lg">Create Branch</Button>
	</div>
</form>
