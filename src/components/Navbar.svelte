<script lang="ts">
	import { page } from '$app/stores';
	function getBranchId() {
		return $page.url.pathname.split('/')[2];
	}
</script>

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
			<a class="btn btn-ghost text-xl" href="/branches">Lokate</a>
		</div>
		<!-- <div class="navbar-end"> -->
		<div class="flex-none gap-2">
			<!-- <div class="form-control">
				<input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
			</div> -->
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
					<!-- <li>
						<a class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a>Settings</a></li> -->
					<form method="POST">
						<!-- action="/logout" -->
						<button
							class="btn btn-link"
							formaction="/dashboard/${getBranchId()}/logout"
							type="submit"
							role="button">Sign out</button
						>
						<!-- <input type="submit" value="Sign out" /> -->
					</form>
				</ul>
			</div>
		</div>
		<!-- </div> -->
	</div>
</nav>
