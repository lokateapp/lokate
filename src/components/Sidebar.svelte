<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';

	const INITIAL_WIDTH = 4;
	let sidebarVisible = false;
	let width = INITIAL_WIDTH;

	function getBranchId() {
		return $page.params.branchId;
	}

	var routes = [
		{
			name: 'campaigns',
			icon: 'fa-solid fa-home fa-lg',
			// link: '/dashboard'
			link: ''
		},
		{
			name: 'beacons',
			// icon: 'fa-solid fa-mobile-android-alt',
			icon: 'fa-solid fa-tower-broadcast',
			link: 'devices'
		},
		{
			name: 'heatmaps',
			icon: 'fa-solid fa-fire  fa-lg',
			link: 'heatmaps'
		},
		{
			name: 'analytics',
			icon: 'fa-solid fa-chart-bar fa-xl',
			link: 'analytics'
		}
	];

	var lastRoute = {
		name: 'settings',
		icon: 'fa-solid fa-gear fa-xl',
		link: 'settings'
	};
</script>

<aside
	id="separator-sidebar"
	class="fixed top-0 left-0 z-10 h-screen transition-transform"
	style="width: {width}rem;"
	aria-label="Sidebar"
	on:mouseenter={() => {
		sidebarVisible = true;
		width = 16;
	}}
	on:mouseleave={() => {
		sidebarVisible = false;
		width = INITIAL_WIDTH;
	}}
>
	<div
		class="h-full px-3 py-4 pt-20 overflow-y-auto bg-gray-50 dark:bg-gray-800 flex flex-col justify-between"
	>
		<ul class="space-y-2 font-medium">
			{#each routes as route}
				<li>
					<div class="flex flex-row items-center {sidebarVisible ? 'justify-start' : ''}">
						<Button
							class="w-full rounded-full text-left p-6 {sidebarVisible && 'justify-start'}"
							on:click={() => {
								window.location.href = `/dashboard/${getBranchId()}/${route.link}`;
							}}
						>
							<i class={route?.icon} />
							{#if sidebarVisible}
								<span class="ml-3 capitalize">{route?.name}</span>
							{:else}
								<span>{''}</span>
							{/if}
						</Button>
					</div>
				</li>
			{/each}
		</ul>
		<ul class="pt-4 mt-4 space-y-2">
			<li>
				<div class="flex flex-row items-center">
					<Button
						class="w-full rounded-full text-left p-6 {sidebarVisible && 'justify-start'}"
						on:click={() => {
							window.location.href = `/dashboard/${getBranchId()}/${lastRoute.link}`;
						}}
					>
						<i class={lastRoute?.icon} />
						{#if sidebarVisible}
							<span class="ml-3 capitalize">{lastRoute?.name}</span>
						{:else}
							<span>{''}</span>
						{/if}
					</Button>
				</div>
			</li>
		</ul>
	</div>
</aside>
