<script lang="ts">
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { Navbar, Footer, Sidebar } from '../components';
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	export let data: PageData;
</script>

<section class="bg-white min-h-screen flex flex-col">
	{#if data.user}
		<Navbar />
		{#if !$page.route.id?.startsWith('/branches')}
			<Sidebar />
			<div class="ml-20">
				<slot />
			</div>
		{:else}
			<slot />
		{/if}
		<!-- sm:ml-64 -->
	{:else}
		<slot />
	{/if}

	{#if !data.user}
		<div class="flex-grow flex flex-col justify-end">
			<Footer />
		</div>
	{/if}
</section>
