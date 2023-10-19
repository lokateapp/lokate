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

{#each data.campaigns as campaign}
	<div>campaign name: {campaign.name}</div>
	<div>campaign id: {campaign.id}</div>
{/each}
