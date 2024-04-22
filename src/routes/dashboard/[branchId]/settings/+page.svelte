<script lang="ts">
	import { notify } from '$components/notify';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	export let form;

	$: {
		if (form?.status == 200) {
			notify(form.body.message, 'success');
		} else {
			notify(form?.body.message || 'An error occurred', 'error');
		}
	}
</script>

<div class="px-4 pt-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Change Password</Card.Title>
			<!-- <Card.Description>Address</Card.Description> -->
		</Card.Header>
		<form method="POST" action="?/changePassword">
			<Card.Content>
				<div class="flex flex-col gap-3">
					<div class="">
						<Label for="current-password">Current password</Label>
						<Input
							type="text"
							id="current-password"
							placeholder="••••••••"
							required
							name="current-password"
						/>
					</div>
					<div class="">
						<Label for="password">New password</Label>
						<Input type="password" id="password" placeholder="••••••••" required name="password" />
					</div>
					<div class="">
						<Label for="confirm-password">Confirm password</Label>
						<Input
							type="text"
							id="confirm-password"
							placeholder="••••••••"
							required
							name="confirm-password"
						/>
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-start">
				<Button type="submit" class="rounded-lg" size="lg">Change password</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
