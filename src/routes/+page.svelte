<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<!-- <img src="/images/stock/photo-1635805737707-575885ab0820.jpg" class="max-w-sm rounded-lg shadow-2xl" /> -->
		<div>
			<h1 class="text-5xl font-bold">Lokate</h1>
			<p class="py-6">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus mollitia quia obcaecati
				quaerat, aliquid minus maxime libero. Doloremque beatae culpa perspiciatis repudiandae aut
				eveniet aperiam atque, eum porro cumque quae!
			</p>
			<button
				class="btn btn-primary"
				on:click={() => {
					window.location.href = '/login';
				}}>Login</button
			>
			<button
				class="btn btn-primary"
				on:click={() => {
					window.location.href = '/signup';
				}}>Sign up</button
			>
		</div>
	</div>
</div>
