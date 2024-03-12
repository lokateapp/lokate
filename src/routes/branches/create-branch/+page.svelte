<form method="POST" action="?/createBranch">
	<div class="flex flex-col justify-center items-center mt-10 gap-10">
		<h1 class="text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap">
			Create new branch
		</h1>
		<div class="form-control w-full max-w-xs">
			<label class="label">
				<span class="label-text">Address</span>
			</label>
			<input
				class="input input-bordered input-primary w-full max-w-xs join-item"
				name="address"
				type="text"
				placeholder="address"
			/>
			<label class="label">
				<span class="label-text">Latitude</span>
			</label>
			<input
				class="input input-bordered input-primary w-full max-w-xs join-item"
				name="latitude"
				type="number"
				placeholder="latitude"
			/>
			<label class="label">
				<span class="label-text">Longitude</span>
			</label>
			<input
				class="input input-bordered input-primary w-full max-w-xs join-item"
				name="longitude"
				type="number"
				placeholder="longitude"
			/>
		</div>
		<button class="btn btn-wide btn-lg btn-primary rounded-full">Create Branch</button>
	</div>
</form>
