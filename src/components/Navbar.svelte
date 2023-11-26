<script lang="ts">
	import { page } from '$app/stores';

	const INITIAL_WIDTH = 4;
	let sidebarVisible = false;
	let width = INITIAL_WIDTH;
	let routeName = '';

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
			name: 'dashboard',
			icon: 'fa-solid fa-home fa-lg',
			link: '/dashboard'
		},
		{
			name: 'analytics',
			icon: 'fa-solid fa-chart-bar fa-lg',
			link: '/dashboard/analytics'
		}
	];

	var lastRoute = {
		name: 'settings',
		icon: 'fa-solid fa-gear fa-lg',
		link: '/dashboard/settings'
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
					<div class="flex flex-row items-center">
						<button
							class="btn btn-circle {routeName == route.name
								? 'btn-primary btn-active'
								: ''} {sidebarVisible ? 'pl-4 justify-start w-full' : ''}"
							on:click={() => {
								window.location.href = route.link;
							}}
						>
							<i class=" {route?.icon}" />
							{#if sidebarVisible}
								<!-- first letter is upper -->
								<span class="ms-3 capitalize">{route?.name}</span>
							{/if}
						</button>
					</div>
				</li>
			{/each}
		</ul>
		<ul class="pt-4 mt-4 space-y-2">
			<li>
				<div class="flex flex-row items-center">
					<button
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
					</button>
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

<nav class="bg-white sticky w-full z-20 top-0 left-0 border-b-2 border-gray-20backdrop-blur-lg">
	<div class="navbar bg-base-100">
		<!-- <div class="navbar-start" /> -->
		<!-- <div class="flex-none">
				<div class="drawer">
					<input type="checkbox" checked={dropdown} class="drawer-toggle" id="my-drawer" />
					<div class="drawer-content">
						<label class="btn btn-circle swap swap-rotate" for="my-drawer">
							<i class="swap-on fa-solid fa-xmark" />
							<i class="swap-off fa-solid fa-bars fa-lg" />
						</label>
					</div>
					<div class="drawer-side">
						<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay" />
						<ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
							<li><a>Sidebar Item 1</a></li>
							<li><a>Sidebar Item 2</a></li>
						</ul>
					</div>
				</div>
			</div> -->
		<button
			data-drawer-target="separator-sidebar"
			data-drawer-toggle="separator-sidebar"
			aria-controls="separator-sidebar"
			type="button"
			class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
			on:click={() => {
				// sidebar = !sidebar;
				// separator-sidebar.classList.toggle('-translate-x-full');
			}}
		>
			<span class="sr-only">Open sidebar</span>
			<!-- <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> -->
			<!-- <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path> -->
			<!-- </svg> -->
			<i class="fa-solid fa-bars" />
		</button>

		<div class="flex-1">
			<a class="btn btn-ghost text-xl" href="/dashboard">Lokate</a>
		</div>
		<!-- <div class="navbar-end"> -->
		<div class="flex-none gap-2">
			<div class="form-control">
				<input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
			</div>
			<div class="dropdown dropdown-end">
				<label tabindex="0" class="btn btn-ghost btn-circle avatar">
					<!-- <div class="w-10 rounded-full"> -->
					<!-- <img
								alt="Tailwind CSS Navbar component"
								src="/images/stock/photo-1534528741775-53994a69daeb.jpg"
							/> -->
					<!-- </div> -->
					<i class="fa-solid fa-user fa-lg" />
				</label>
				<ul
					tabindex="0"
					class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
				>
					<li>
						<a class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a>Settings</a></li>
					<form method="POST">
						<button class="btn" formaction="/logout" type="submit" role="button">Sign out</button>
						<!-- <input type="submit" value="Sign out" /> -->
					</form>
				</ul>
			</div>
		</div>
		<!-- </div> -->
	</div>
</nav>
