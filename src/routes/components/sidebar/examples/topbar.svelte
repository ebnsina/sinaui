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
	<SidebarLayout
		label="Reading room"
		{groups}
		{current}
		crumbs={[
			{ label: 'Reading room', href: '#top-home' },
			{ label: current === '#top-home' ? 'Home' : 'Catalog' }
		]}
		onselect={(item) => (current = item.href)}
	>
		{#snippet topbar()}
			<Button variant="secondary">Reserve a seat</Button>
		{/snippet}
		<p class="page">
			The collapse button and the breadcrumb sit in the top bar, your actions at its end.
		</p>
	</SidebarLayout>
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 20rem;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) + 0.25rem);
		background: var(--ui-surface);
		border: 1px solid var(--ui-field-line);
	}
	.page {
		margin: 0;
		padding: 1.25rem 1.5rem;
		color: var(--ui-muted);
	}
</style>
