<script lang="ts">
	import { Menu01Icon, Search01Icon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import CommandPalette, { type Command } from '#lib/ui/CommandPalette.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import DocsNav from '#lib/ui/DocsNav.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Kbd from '#lib/ui/Kbd.svelte';
	import ThemeToggle from '#lib/ui/ThemeToggle.svelte';
	import { scrollEdges } from '#lib/ui/scroll-edges.js';
	import { locate, type DocsSection } from './docs.js';

	interface Props {
		/** The product, as the docs are named ("Qamar docs") and as the logo reads without a logo snippet. */
		name: string;
		/** Top-bar tabs, each with its sidebar groups. With one, no tabs show. */
		sections: DocsSection[];
		/** Path of the page being shown. */
		current: string;
		/** Where the logo links. */
		home?: string;
		/** In place of the product name at the start of the top bar. */
		logo?: Snippet;
		/** The main link at the end of the top bar ("Dashboard", "Sign in"). */
		action?: { label: string; href: string };
		/**
		 * Bring-your-own search: matches for a query, such as hits from a full-text index. Without it,
		 * search finds pages by title.
		 */
		search?: (query: string) => Command[];
		/** What search says with no matches: also where a failed or loading index explains itself. */
		searchEmpty?: string;
		/** Opens a page chosen in search; pass SvelteKit's goto. A full page load without it. */
		onnavigate?: (href: string) => void;
		/** Under the page, such as links to llms.txt or a changelog. */
		footer?: Snippet;
		/** The page: usually a DocsPage. */
		children: Snippet;
	}

	let {
		name,
		sections,
		current,
		home = '/',
		logo,
		action,
		search,
		searchEmpty = 'Nothing matches. Try fewer or different words.',
		onnavigate = (href) => location.assign(href),
		footer,
		children
	}: Props = $props();

	const place = $derived(locate(sections, current));
	const label = $derived(`${name} docs`);

	let menu = $state(false);
	let searching = $state(false);

	const commands: Command[] = $derived(
		sections.flatMap((s) =>
			s.groups.flatMap((g) =>
				g.items.map((i) => ({
					id: i.href,
					label: i.label,
					group: s.label,
					keywords: g.title ? [g.title] : [],
					onselect: () => onnavigate(i.href)
				}))
			)
		)
	);
</script>

{#snippet tabs(onclick?: () => void)}
	{#each sections as s (s.href)}
		<a href={s.href} aria-current={s === place.section ? 'page' : undefined} {onclick}>{s.label}</a>
	{/each}
{/snippet}

<div class="docs-layout">
	<a class="skip" href="#docs-content">Skip to content</a>

	<header class="bar">
		<span class="menu">
			<Button
				variant="ghost"
				square
				aria-label="Open the {label} menu"
				aria-haspopup="dialog"
				onclick={() => (menu = true)}
			>
				<Icon icon={Menu01Icon} size={20} />
			</Button>
		</span>
		<a class="brand" href={home}>
			{#if logo}{@render logo()}{:else}{name}{/if}
		</a>
		{#if sections.length > 1}
			<nav class="tabs" aria-label="{label} sections">{@render tabs()}</nav>
		{/if}
		<div class="end">
			<button
				type="button"
				class="search"
				aria-label="Search the docs"
				aria-haspopup="dialog"
				onclick={() => (searching = true)}
			>
				<Icon icon={Search01Icon} size={16} />
				<span class="search-label" aria-hidden="true">Search docs</span>
				<span class="search-keys"><Kbd keys={['mod', 'K']} /></span>
			</button>
			<ThemeToggle size="sm" />
			{#if action}
				<span class="action">
					<Button href={action.href} size="sm">{action.label}</Button>
				</span>
			{/if}
		</div>
	</header>

	<div class="body">
		<div class="side" {@attach scrollEdges} data-fade>
			<DocsNav
				label={place.section.label}
				groups={place.section.groups}
				current={place.item?.href}
			/>
		</div>
		<main id="docs-content" tabindex="-1">
			{@render children()}
			{#if footer}<footer class="foot">{@render footer()}</footer>{/if}
		</main>
	</div>
</div>

<!-- Narrow screens: the tabs and the sidebar in a sheet from the start edge. -->
<Dialog bind:open={menu} side="start" title={label}>
	{#if sections.length > 1}
		<nav class="sheet-tabs" aria-label="{label} sections">{@render tabs(() => (menu = false))}</nav>
	{/if}
	<DocsNav
		label={place.section.label}
		groups={place.section.groups}
		current={place.item?.href}
		onselect={() => (menu = false)}
	/>
	{#if action}<p class="sheet-action"><a href={action.href}>{action.label}</a></p>{/if}
</Dialog>

<CommandPalette
	bind:open={searching}
	{commands}
	{search}
	label="Search the {label}"
	placeholder="Search the docs…"
	empty={searchEmpty}
/>

<style>
	.docs-layout {
		--docs-bar-h: 3.5rem;
		min-block-size: 100dvh;
		background: var(--ui-bg);
		color: var(--ui-fg);
		font-family: var(--ui-font);
	}
	.skip {
		position: absolute;
		inset-inline-start: 1rem;
		inset-block-start: -3rem;
		z-index: 20;
		padding: 0.5rem 0.75rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-accent);
		color: var(--ui-on-accent);
	}
	.skip:focus {
		inset-block-start: 0.5rem;
	}
	.bar {
		position: sticky;
		inset-block-start: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 2rem;
		block-size: var(--docs-bar-h);
		padding-inline: 1.25rem;
		box-sizing: border-box;
		background: color-mix(in srgb, var(--ui-bg) 88%, transparent);
		box-shadow: inset 0 -1px var(--ui-line);
		backdrop-filter: blur(12px);
	}
	.brand {
		display: flex;
		flex: none;
		align-items: center;
		gap: 0.5rem;
		color: var(--ui-fg);
		font-weight: 600;
		text-decoration: none;
	}
	.tabs {
		display: flex;
		align-self: stretch;
		gap: 1.5rem;
		min-inline-size: 0;
	}
	.tabs a {
		display: flex;
		align-items: center;
		color: var(--ui-muted);
		font-size: 0.875rem;
		text-decoration: none;
		white-space: nowrap;
		transition:
			color var(--ui-dur) ease,
			box-shadow var(--ui-dur) ease;
	}
	.tabs a:hover {
		color: var(--ui-fg);
	}
	.tabs a[aria-current] {
		color: var(--ui-fg);
		font-weight: 500;
		box-shadow: inset 0 -2px var(--ui-fg);
	}
	.end {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-inline-start: auto;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		inline-size: 15rem;
		block-size: 2rem;
		padding: 0 0.375rem 0 0.625rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
		color: var(--ui-muted);
		font: 0.875rem var(--ui-font);
		cursor: pointer;
		transition: background-color var(--ui-dur) ease;
	}
	.search:hover {
		background: var(--ui-hover);
	}
	.search-label {
		flex: 1;
		text-align: start;
	}
	.brand:focus-visible,
	.tabs a:focus-visible,
	.search:focus-visible,
	.sheet-tabs a:focus-visible {
		border-radius: var(--ui-radius-control);
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.menu {
		display: none;
		margin-inline-start: -0.5rem;
	}
	.body {
		display: grid;
		grid-template-columns: 16.5rem minmax(0, 1fr);
	}
	.side {
		position: sticky;
		inset-block-start: var(--docs-bar-h);
		align-self: start;
		block-size: calc(100dvh - var(--docs-bar-h));
		box-sizing: border-box;
		padding: 1.5rem 1rem 2rem;
		overflow-y: auto;
		box-shadow: inset -1px 0 var(--ui-line);
		scrollbar-width: thin;
	}
	main {
		min-inline-size: 0;
		outline: none;
	}
	.foot {
		padding: 1.5rem 2.5rem 2.5rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
		text-align: center;
	}
	.foot :global(a) {
		color: inherit;
	}
	.sheet-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-block-end: 1.5rem;
	}
	.sheet-tabs a {
		display: flex;
		align-items: center;
		min-block-size: var(--ui-control-h-touch);
		padding: 0 0.75rem;
		box-sizing: border-box;
		border-radius: 999px;
		color: var(--ui-muted);
		font-size: 0.875rem;
		text-decoration: none;
	}
	.sheet-tabs a[aria-current] {
		background: var(--ui-subtle);
		color: var(--ui-fg);
		font-weight: 500;
	}
	.sheet-action {
		margin: 1.5rem 0 0;
		padding-inline: 0.625rem;
		font-size: 0.875rem;
	}
	.sheet-action a {
		color: var(--ui-fg);
	}
	@media (max-width: 64rem) {
		.tabs,
		.action {
			display: none;
		}
		.search {
			inline-size: 12rem;
		}
	}
	@media (max-width: 56rem) {
		.menu {
			display: block;
		}
		.body {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			display: none;
		}
		.bar {
			gap: 0.5rem;
			padding-inline: 1rem;
		}
		.search {
			justify-content: center;
			inline-size: 2.5rem;
			block-size: 2.5rem;
			padding: 0;
			background: none;
			color: var(--ui-fg);
		}
		.search-label,
		.search-keys {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.tabs a,
		.search {
			transition: none;
		}
	}
</style>
