<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from 'flowbite-svelte';

	const INITIAL_WIDTH = 4;
	let sidebarVisible = false;
	let width = INITIAL_WIDTH;
	let routeName = '';

	function getBranchId() {
		return $page.url.pathname.split('/')[2];
	}

	page.subscribe((value) => {
		// console.log('page changed', value.route);
		if (value.route.id) {
			const splittedRouteName = value.route.id.split('/');
			routeName = splittedRouteName[splittedRouteName.length - 1];
			// console.log('routeName: ', routeName);
		}
	});

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
			// icon : BeaconSvg,
			// svg: BeaconSvg,
			link: 'devices'
		},
		{
			name: 'heatmaps',
			icon: 'fa-solid fa-fire  fa-lg',
			link: 'heatmaps'
		},
		// {
		// 	name: 'users',
		// 	icon: 'fa-solid fa-users fa-lg',
		// 	link: '/dashboard/users'
		// },
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

<!-- -translate-x-full sm:translate-x-0 -->
<aside
	id="separator-sidebar"
	class="fixed top-0 left-0 z-10 h-screen transition-transform"
	style="width: {width}rem;"
	aria-label="Sidebar"
	on:mouseenter={() => {
		// bind:clientWidth={width}
		// console.log('mouse enter');
		sidebarVisible = true;
		width = 16;
	}}
	on:mouseleave={() => {
		// console.log('mouse leave');
		sidebarVisible = false;
		width = INITIAL_WIDTH;
	}}
>
	<div
		class="h-full px-3 py-4 pt-20 overflow-y-auto bg-gray-50 dark:bg-gray-800 flex flex-col justify-between"
	>
		<ul class="space-y-2 font-medium">
			{#each routes as route}
				<!-- if route last item -->
				<li>
					<div class="flex flex-row items-center {sidebarVisible ? 'justify-start' : ''}">
						<Button
							color="blue"
							pill
							active={routeName == route.name}
							class="w-full text-left {sidebarVisible ? 'justify-start p-4' : '!p-6'}"
							on:click={() => {
								window.location.href = `/dashboard/${getBranchId()}/${route.link}`;
							}}
						>
							<!-- {#if route.svg}
								<img src={route.svg} class="w-7 h-7" alt="Beacon" />
							{:else} -->
							<!-- {/if} -->
							<i class={route?.icon} />
							{#if sidebarVisible}
								<!-- first letter is upper -->
								<span class="ml-3 capitalize">{route?.name}</span>
							{:else}
								<span>{''}</span>
							{/if}
						</Button>
						<!-- <button

							class="btn btn-circle{routeName == route.name
								? 'btn-primary btn-active'
								: ''} {sidebarVisible ? 'justify-start' : ''}"
							on:click={() => {
								window.location.href = route.link;
							}}
						>
							{#if route.svg}
								<img src="{route.svg}" class="w-7 h-7" alt="Beacon" />
							{:else}
								<i class=" {route?.icon}" />
							{/if}
							{#if sidebarVisible}
								<span class="ml-3 capitalize">{route?.name}</span>
							{/if}
						</button> -->
					</div>
				</li>
			{/each}
		</ul>
		<ul class="pt-4 mt-4 space-y-2">
			<li>
				<div class="flex flex-row items-center">
					<!-- <button
						class="btn btn-circle {routeName == lastRoute.name
							? 'btn-primary btn-active'
							: ''} {sidebarVisible ? 'pl-4 justify-start w-full' : ''}"
						on:click={() => {
							window.location.href = lastRoute.link;
						}}
					>
						<i class=" {lastRoute.icon}" />
						{#if sidebarVisible}
							<span class="ms-3 capitalize">{lastRoute.name}</span>
						{/if}
					</button> -->
					<Button
						color="dark"
						pill
						active={routeName == lastRoute.name}
						class="w-full text-left {sidebarVisible ? 'justify-start p-4' : '!p-6'}"
						on:click={() => {
							window.location.href = `/dashboard/${getBranchId()}/${lastRoute.link}`;
						}}
					>
						<i class={lastRoute?.icon} />
						{#if sidebarVisible}
							<!-- first letter is upper -->
							<span class="ml-3 capitalize">{lastRoute?.name}</span>
						{:else}
							<span>{''}</span>
						{/if}
					</Button>
				</div>
			</li>
		</ul>
		<!-- <ul class="space-y-2 font-medium">
			<li>
				<a
					href="/dashboard"
					class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
				>
					<svg
						class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 22 21"
					>
						<path
							d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"
						/>
						<path
							d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"
						/>
					</svg>
					{#if sidebarVisible}
						<span class="ms-3">Dashboard</span>
					{/if}
				</a>
			</li>
			<li>
				<a
					href="/dashboard/analytics"
					class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
				>
					<svg
						class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 18 18"
					>
						<path
							d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"
						/>
					</svg>
					<span class="flex-1 ms-3 whitespace-nowrap">Analytics</span>
				</a>
			</li>
		</ul> -->
		<!-- <ul class="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
			<li>
				<a
					href="#"
					class="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
				>
					<i class="fa-solid fa-gear fa-lg" />

					<span class="ms-3">Settings</span>
				</a>
			</li>
		</ul> -->
	</div>
</aside>
