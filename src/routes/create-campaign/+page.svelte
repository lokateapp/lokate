<script lang="ts">
	import yellowBeacon from '$lib/assets/yellowbeacon.png';
	import greenBeacon from '$lib/assets/greenbeacon.jpg';
	import blueBeacon from '$lib/assets/bluebeacon.webp';

	let selectedBeacon = 'none';

	function beaconStyles(selectedBeacon: string, thisBeacon: string) {
		if (selectedBeacon === thisBeacon) {
			return 'p-10 border-4 border-green-400 rounded-lg shadow hover:bg-green-200 w-[250px] h-[300px]';
		} else {
			return 'p-10 border-4 border-gray-200 rounded-lg shadow hover:bg-gray-100 w-[250px] h-[300px]';
		}
	}
</script>

<form method="POST" action="?/createCampaign">
	<div class="flex flex-col justify-center items-center mt-10 gap-10">
		<h1 class="text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap">
			Create new campaign
		</h1>
		<div class="form-control w-full max-w-xs">
			<label class="label">
				<span class="label-text">Campaign name</span>
			</label>
			<input
				class="input input-bordered input-primary w-full max-w-xs join-item"
				name="name"
				type="text"
				placeholder="Campaign name"
			/>
		</div>
		<button class="btn btn-wide btn-lg btn-primary rounded-full">Create Campaign</button>
	</div>
</form>

<div class="flex justify-center items-center my-10 mx-20 gap-10">
	<div class={beaconStyles(selectedBeacon, 'yellow')} on:click={() => (selectedBeacon = 'yellow')}>
		<img src={yellowBeacon} />
	</div>
	<div class={beaconStyles(selectedBeacon, 'green')} on:click={() => (selectedBeacon = 'green')}>
		<img src={greenBeacon} width="200" />
	</div>
	<div class={beaconStyles(selectedBeacon, 'blue')} on:click={() => (selectedBeacon = 'blue')}>
		<img src={blueBeacon} width="200" />
	</div>
</div>
