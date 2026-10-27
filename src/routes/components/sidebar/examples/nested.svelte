<script lang="ts">
	import { BookOpen01Icon, Home01Icon, Location01Icon } from '@hugeicons/core-free-icons';
	import SidebarLayout, { type SidebarGroup } from '#lib/ui/SidebarLayout.svelte';

	const groups: SidebarGroup[] = [
		{
			items: [
				{ label: 'Home', href: '#home', icon: Home01Icon },
				{
					label: 'Collections',
					href: '#collections',
					icon: BookOpen01Icon,
					children: [
						{ label: 'Manuscripts', href: '#manuscripts' },
						{ label: 'Maps', href: '#maps' },
						{ label: 'Star charts', href: '#star-charts', badge: 3 }
					]
				},
				{
					label: 'Reading rooms',
					href: '#rooms',
					icon: Location01Icon,
					children: [
						{ label: 'Baghdad', href: '#baghdad' },
						{ label: 'Córdoba', href: '#cordoba' }
					]
				}
			]
		}
	];
	let current = $state('#maps');
	const title = $derived(
		groups
			.flatMap((g) => g.items)
			.flatMap((i) => i.children ?? [i])
			.find((i) => i.href === current)?.label
	);
</script>

<!-- A framed app for the example; in your app, give the layout the whole window. -->
<div class="frame">
	<SidebarLayout label="Archive" {groups} {current} onselect={(item) => (current = item.href)}>
		{#snippet header(collapsed)}
			<span class="brand">
				<span class="mark" aria-hidden="true">B</span>
				{#if !collapsed}<strong>Bayt al-Ḥikma</strong>{/if}
			</span>
		{/snippet}
		<div class="page">
			<h4>{title}</h4>
			<p>
				Collections opened by itself, since its Maps page is current. Collapsed to icons, a parent
				opens its pages beside the rail.
			</p>
		</div>
	</SidebarLayout>
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 28rem;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.mark {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 1.75rem;
		block-size: 1.75rem;
		border-radius: calc(var(--ui-radius) * 0.75);
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		font-weight: 600;
	}
	.page {
		padding: 1.25rem 1.5rem;
	}
	h4 {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
	}
	p {
		margin: 0;
		color: var(--ui-muted);
	}
</style>
