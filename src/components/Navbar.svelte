<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { SelectBranch } from '$lib/schema';

	export let branches: SelectBranch[] | undefined;

	function getBranchId() {
		return $page.params.branchId;
	}

	let branchId = getBranchId() || '';
	let afterBranchId: string;

	page.subscribe(({ route }) => {
		branchId = getBranchId() || '';

		if (route.id) {
			const splittedRouteName = route.id.split('/');
			if (splittedRouteName.length > 3) {
				afterBranchId = splittedRouteName[splittedRouteName.length - 1];
			} else {
				afterBranchId = '';
			}
		}
	});

	let currentBranchName: string;
	$: {
		currentBranchName = branches
			? branches.find((branch) => branch.id === branchId)?.address || ''
			: '';
	}
</script>

<nav
	class="bg-base-100 sticky w-full z-20 top-0 left-0 border-b-2 border-gray-20backdrop-blur-lg px-5"
>
	<div class="navbar">
		<div class="flex-1 flex-row text-lg gap-10">
			<!-- <a class="btn btn-ghost text-xl" href="/branches">Lokate</a> -->
			<Button href="/branches" variant="ghost" size="lg" class="text-xl rounded-lg">Lokate</Button>

			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/branches" class="text-base">Home</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class="flex items-center gap-1 text-base">
								Branches
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start" class="p-2">
								<DropdownMenu.Separator />
								{#if branches}
									{#each branches as branch}
										<DropdownMenu.Item
											class="text-base"
											on:click={() => {
												window.location.href = `/dashboard/${branch.id}`;
											}}
										>
											{branch.address}
										</DropdownMenu.Item>
									{/each}
								{/if}
								<DropdownMenu.Separator />
								<DropdownMenu.Item
									class="text-base font-semibold"
									on:click={() => {
										window.location.href = '/branches/create-branch';
									}}
								>
									Add new branch
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Breadcrumb.Item>
					{#if currentBranchName !== ''}
						<Breadcrumb.Separator />
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/dashboard/{branchId}" class="text-base">
								{currentBranchName}
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						{#if afterBranchId}
							<Breadcrumb.Separator />
							<Breadcrumb.Item>
								<Breadcrumb.Link
									href="/dashboard/{branchId}/{afterBranchId}"
									class="text-base capitalize"
								>
									{afterBranchId}
								</Breadcrumb.Link>
							</Breadcrumb.Item>
						{/if}
					{/if}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>
		<div class="flex-none gap-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="flex items-center gap-1 text-base">
					<Button id="user-drop" variant="ghost" size="icon" class="rounded-full">
						<i class="fa-solid fa-user fa-lg" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="center" class="">
					<form method="POST">
						<Button
							variant="ghost"
							class="w-full"
							formaction="/dashboard/${branchId}}/logout"
							type="submit"
							role="button"
						>
							Sign out
						</Button>
					</form>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</nav>
