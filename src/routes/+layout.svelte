<script lang="ts">
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { Navbar, Footer } from '../components';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="bg-white min-h-screen flex flex-col">
	{#if data.user}
		<Navbar />
	{/if}
	<div class="sm:ml-64">
		<slot />
	</div>
	{#if !data.user}
		<div class="flex-grow flex flex-col justify-end">
			<Footer />
		</div>
	{/if}
</section>
