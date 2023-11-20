<script>
	let dropdown = false;
</script>

<nav class="bg-white sticky w-full z-20 top-0 left-0 border-b-2 border-gray-20backdrop-blur-lg">
	<div class="navbar bg-base-100">
		<!-- <div class="navbar-start" /> -->
		<div class="flex-none">
			<div class="drawer">
				<!-- dropdown ? document.body.classList.add('dropdown-open') : document.body.classList.remove('dropdown-open'); -->
				<input type="checkbox" checked={dropdown} class="drawer-toggle" id="my-drawer" />
				<div class="drawer-content">
					<label class="btn btn-circle swap swap-rotate" for="my-drawer">
						<!-- this hidden checkbox controls the state -->
						<i class="swap-on fa-solid fa-xmark" />
						<i class="swap-off fa-solid fa-bars fa-lg" />
					</label>
				</div>
				<!-- <label tabindex="0" class="btn btn-ghost btn-circle">
					<i class="fa-solid fa-bars fa-lg" />
				</label> -->
				<div class="drawer-side">
					<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay" />
					<ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
						<!-- Sidebar content here -->
						<li><a>Sidebar Item 1</a></li>
						<li><a>Sidebar Item 2</a></li>
					</ul>
				</div>
			</div>
		</div>
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
					<li><a>Logout</a></li>
				</ul>
			</div>
		</div>
		<!-- </div> -->
	</div>
</nav>
