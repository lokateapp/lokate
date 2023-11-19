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
	<label>
		Campaign name
		<input name="name" type="text" />
	</label>
	<button>Create Campaign</button>
</form>

<div class="flex justify-center items-center mx-20 gap-10">
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
