<script>
</script>

<footer class="bg-white border-t-2 border-gray-200">
	<div class="mx-auto w-full">
		<footer class="footer p-10 bg-base-200 text-base-content">
			<nav>
				<header class="footer-title">Services</header>
				<a class="link link-hover">Branding</a>
				<a class="link link-hover">Design</a>
				<a class="link link-hover">Marketing</a>
				<a class="link link-hover">Advertisement</a>
			</nav>
			<nav>
				<header class="footer-title">Company</header>
				<a class="link link-hover">About us</a>
				<a class="link link-hover">Contact</a>
				<a class="link link-hover">Jobs</a>
				<a class="link link-hover">Press kit</a>
			</nav>
			<nav>
				<header class="footer-title">Legal</header>
				<a class="link link-hover">Terms of use</a>
				<a class="link link-hover">Privacy policy</a>
				<a class="link link-hover">Cookie policy</a>
			</nav>
			<form>
				<header class="footer-title">Newsletter</header>
				<fieldset class="form-control w-80">
					<label class="label">
						<span class="label-text">Enter your email address</span>
					</label>
					<div class="join">
						<input
							type="text"
							placeholder="username@site.com"
							class="input input-bordered join-item"
						/>
						<button class="btn btn-primary join-item">Subscribe</button>
					</div>
				</fieldset>
			</form>
			<nav>
				<button
					class="btn"
					on:click={async () => {
						await fetch('/deleteAll');
						await fetch('/buildZero?demo=market');
					}}>Market</button
				>
				<button
					class="btn"
					on:click={async () => {
						await fetch('/deleteAll');
						await fetch('/buildZero?demo=museum');
					}}>Museum</button
				>
				<button
					class="btn"
					on:click={async () => {
						await fetch('/deleteAll');
						await fetch('/buildZero?demo=gym');
					}}>Gym</button
				>
			</nav>
		</footer>
	</div>
</footer>
