<script lang="ts">
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { Navbar, Footer, Sidebar } from '../components';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { Toaster } from 'svelte-sonner';

	export let data: PageData;
</script>

<section class="bg-white w-screen h-fit min-h-screen">
	{#if data.user}
		<Navbar branches={data.branches} />
		{#if !$page.route.id?.startsWith('/branches')}
			<Sidebar />
			<div class="ml-20">
				<slot />
			</div>
		{:else}
			<slot />
		{/if}
	{:else}
		<slot />
	{/if}

	{#if !data.user}
		<div class="flex-grow flex flex-col justify-end">
			<Footer />
		</div>
	{/if}
</section>
<Toaster richColors position="top-right" />
