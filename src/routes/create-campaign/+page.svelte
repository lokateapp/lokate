<script lang="ts">
	import yellowBeacon from '$lib/assets/yellowbeacon.png';
	import greenBeacon from '$lib/assets/greenbeacon.jpg';
	import blueBeacon from '$lib/assets/bluebeacon.webp';

	let selectedBeacon = 'none';
</script>

<form method="POST" action="?/createCampaign">
	<label>
		Campaign name
		<input name="name" type="text" />
	</label>
	<button>Create Campaign</button>
</form>

<div class="flex justify-center items-center mx-20 gap-10">
	<div
		class="p-10 border border-gray-200 rounded-lg shadow hover:bg-gray-100"
		on:click={() => (selectedBeacon = 'yellow')}
	>
		<img src={yellowBeacon} width="200" />
	</div>
	<div
		class="p-10 border border-gray-200 rounded-lg shadow hover:bg-gray-100"
		on:click={() => (selectedBeacon = 'green')}
	>
		<img src={greenBeacon} width="200" />
	</div>
	<div
		class="p-10 border border-gray-200 rounded-lg shadow hover:bg-gray-100"
		on:click={() => (selectedBeacon = 'blue')}
	>
		<img src={blueBeacon} width="200" />
	</div>
</div>

{selectedBeacon}
