<script lang="ts">
	import { BookOpen01Icon, Home01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import SidebarLayout, { type SidebarGroup } from '#lib/ui/SidebarLayout.svelte';

	const groups: SidebarGroup[] = [
		{
			items: [
				{ label: 'Home', href: '#top-home', icon: Home01Icon },
				{ label: 'Catalog', href: '#top-catalog', icon: BookOpen01Icon }
			]
		}
	];
	let current = $state('#top-home');
</script>

<div class="frame">
	<SidebarLayout label="Reading room" {groups} {current} onselect={(item) => (current = item.href)}>
		{#snippet topbar()}
			<div class="top">
				<strong>Reading room</strong>
				<Button size="sm" variant="outline">Reserve a seat</Button>
			</div>
		{/snippet}
		<p class="page">The collapse button sits in the top bar, beside your own controls.</p>
	</SidebarLayout>
</div>

<style>
	.frame {
		--ui-sidebar-line: var(--ui-line);
		inline-size: 100%;
		block-size: 20rem;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-inline: 0.5rem 0.25rem;
	}
	.page {
		margin: 0;
		padding: 1.25rem 1.5rem;
		color: var(--ui-muted);
	}
</style>
