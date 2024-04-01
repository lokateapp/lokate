<script lang="ts">
	export let heatmapMatrix: number[][] = [];
</script>

{#if heatmapMatrix && heatmapMatrix.length > 0}
	<div
		class="heatmap-container"
		style="width: {heatmapMatrix[0].length}px; height: {heatmapMatrix.length}px"
	>
		{#each heatmapMatrix as row}
			<div class="heatmap-row">
				{#each row as value}
					<div class="heatmap-cell" style="background-color: rgba(255, 0, 0, {value / 1.33});" />
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	.heatmap-container {
		position: absolute;
		top: 0;
		left: 0;
	}

	.heatmap-row {
		display: flex;
	}

	.heatmap-cell {
		flex: 1;
		height: 1px;
	}
</style>
