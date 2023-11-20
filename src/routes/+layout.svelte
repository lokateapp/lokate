<script lang="ts">
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { Navbar, Footer } from '../components';
</script>

<section class="bg-white min-h-screen flex flex-col">
	<Navbar />
	<slot />
	<div class="flex-grow flex flex-col justify-end">
		<Footer />
	</div>
</section>
