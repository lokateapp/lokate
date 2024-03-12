<script lang="ts">
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { Navbar, Footer } from '../components';
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	export let data: PageData;
</script>

<section class="bg-white min-h-screen flex flex-col">
	{#if data.user && !$page.route.id?.startsWith('/branches')}
		<Navbar />
		<!-- sm:ml-64 -->
		<div class="ml-20">
			<slot />
		</div>
	{:else}
		<slot />
	{/if}

	{#if !data.user}
		<div class="flex-grow flex flex-col justify-end">
			<Footer />
		</div>
	{/if}
</section>
