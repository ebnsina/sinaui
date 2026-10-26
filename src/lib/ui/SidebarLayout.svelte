<script lang="ts" module>
	import type { Home01Icon } from '@hugeicons/core-free-icons';

	export interface SidebarItem {
		label: string;
		href: string;
		icon: typeof Home01Icon;
		/** A count beside the name, such as items waiting; hidden at 0. */
		badge?: number;
	}
	export interface SidebarGroup {
		title?: string;
		items: SidebarItem[];
	}
</script>

<script lang="ts">
	import { ease, reduced } from './motion';
	import { onMount, tick, type Snippet } from 'svelte';
	import { Menu01Icon, SidebarLeftIcon } from '@hugeicons/core-free-icons';
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
	import Tooltip from './Tooltip.svelte';
	import { glide } from './glide';
	import { scrollEdges } from './scroll-edges';
	import { load, save } from './stored';

	interface Props {
		/** Names the navigation ("Library"). */
		label: string;
		groups: SidebarGroup[];
		/** href of the page being shown. */
		current?: string;
		collapsed?: boolean;
		/** Remember collapsed/expanded in this browser under this key. */
		persist?: string;
		/** Called when an item is chosen (links still navigate). */
		onselect?: (item: SidebarItem) => void;
		/** Top of the sidebar; given whether it's collapsed, to show a compact mark in the rail. */
		header?: Snippet<[boolean]>;
		footer?: Snippet;
		/** A bar above the page on every screen size; the collapse button moves into it. */
		topbar?: Snippet;
		children: Snippet;
	}

	let {
		label,
		groups,
		current,
		collapsed = $bindable(false),
		persist,
		onselect,
		header,
		footer,
		topbar,
		children
	}: Props = $props();

	const id = $props.id();
	let nav = $state<HTMLElement>();
	let main: HTMLElement;
	let hoverPill = $state<HTMLSpanElement>();
	let currentPill = $state<HTMLSpanElement>();
	let drawer = $state(false);
	let settled = false;

	onMount(() => {
		if (persist) collapsed = load(persist, false);
	});

	/**
	 * Collapses or expands with transforms only: the layout changes in one step, then the content is
	 * slid from where it was to where it now is (FLIP). Animating the width would reflow every frame.
	 */
	async function toggle() {
		const before = main.getBoundingClientRect().left;
		collapsed = !collapsed;
		if (persist) save(persist, collapsed);
		await tick();
		const shift = before - main.getBoundingClientRect().left;
		if (shift && !reduced())
			main.animate([{ transform: `translateX(${shift}px)` }, { transform: 'none' }], {
				duration: 240,
				easing: ease.standard
			});
	}

	// The current page's pill glides when the page changes or the sidebar resizes; it snaps the first time.
	$effect(() => {
		void [current, collapsed];
		if (!nav || !currentPill) return;
		const link = nav.querySelector<HTMLElement>('a[aria-current="page"]');
		requestAnimationFrame(() => {
			if (currentPill) glide(currentPill, link, settled, 180);
			settled = true;
		});
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key.toLowerCase() === 'b' && (e.metaKey || e.ctrlKey) && !e.altKey) {
			e.preventDefault();
			toggle();
		}
	}}
/>

{#snippet link(item: SidebarItem, extra: object = {})}
	<a
		href={item.href}
		class="item"
		aria-current={item.href === current ? 'page' : undefined}
		{...extra}
		onclick={() => {
			drawer = false;
			onselect?.(item);
		}}
	>
		<Icon icon={item.icon} size={18} />
		<span class="text">{item.label}</span>
		{#if item.badge}<span class="badge">{item.badge}</span>{/if}
	</a>
{/snippet}

{#snippet fold(extra: object = {})}
	<button
		type="button"
		class="fold"
		aria-expanded={!collapsed}
		aria-controls="{id}-content"
		aria-keyshortcuts="Control+B Meta+B"
		{...extra}
		onclick={toggle}
	>
		<Icon icon={SidebarLeftIcon} size={18} />
	</button>
{/snippet}

{#snippet list(asRail: boolean)}
	{#each groups as group, g (g)}
		{#if group.title}<p class="group">{group.title}</p>{/if}
		<ul>
			{#each group.items as item (item.href)}
				<li>
					{#if asRail}
						<!-- Icons only: the tooltip shows the name and is the link's name for screen readers. -->
						<Tooltip text={item.label} labels side="right">
							{#snippet trigger(props)}{@render link(item, props)}{/snippet}
						</Tooltip>
					{:else}
						{@render link(item)}
					{/if}
				</li>
			{/each}
		</ul>
	{/each}
{/snippet}

<!-- The outer box is the container its own width is measured by; the grid sits inside it. -->
<div class="shell">
	<div class={['app', collapsed && 'collapsed']}>
		<aside class="sidebar" aria-label={label}>
			{#if header}<div class="head">{@render header(collapsed)}</div>{/if}
			<nav
				bind:this={nav}
				{@attach scrollEdges}
				data-fade
				aria-label={label}
				onpointerover={(e) => {
					if (e.pointerType === 'touch' || !hoverPill) return;
					// The current page already has its own fill; hovering it adds nothing.
					const a = (e.target as Element).closest<HTMLElement>('a.item');
					glide(hoverPill, a?.hasAttribute('aria-current') ? null : a, true);
				}}
				onpointerleave={() => hoverPill && glide(hoverPill, null, false)}
			>
				<span class="pill current" aria-hidden="true" bind:this={currentPill}></span>
				<span class="pill hover" aria-hidden="true" bind:this={hoverPill}></span>
				{@render list(collapsed)}
			</nav>
			<div class="foot">
				{@render footer?.()}
				{#if !topbar}
					<Tooltip text="{collapsed ? 'Expand' : 'Collapse'} sidebar" labels side="right">
						{#snippet trigger(props)}{@render fold(props)}{/snippet}
					</Tooltip>
				{/if}
			</div>
		</aside>

		<div bind:this={main} id="{id}-content" class="main" {@attach scrollEdges} data-fade>
			<!-- Phones: the same navigation, one tap away. With a topbar, it shows on every screen. -->
			<div
				class={['bar', topbar && 'top']}
				role={topbar ? undefined : 'navigation'}
				aria-label={topbar ? undefined : label}
			>
				<button
					type="button"
					class="menu"
					aria-label="Open {label}"
					onclick={() => (drawer = true)}
				>
					<Icon icon={Menu01Icon} size={20} />
				</button>
				{#if topbar}
					<Tooltip text="{collapsed ? 'Expand' : 'Collapse'} sidebar" labels side="bottom">
						{#snippet trigger(props)}{@render fold(props)}{/snippet}
					</Tooltip>
				{/if}
				{#if header}<div class="bar-head">{@render header(false)}</div>{/if}
				{#if topbar}<div class="bar-top">{@render topbar()}</div>{/if}
			</div>
			{@render children()}
		</div>
	</div>
</div>

<!-- Narrow screens: the same navigation in a sheet from the start edge. -->
<Dialog bind:open={drawer} side="start" title={label}>
	<nav class="sheet-nav" aria-label={label}>{@render list(false)}</nav>
	<!-- The sidebar's footer too (a folder tree, storage), so nothing is desktop-only. -->
	{#if footer}<div class="sheet-foot">{@render footer()}</div>{/if}
</Dialog>

<style>
	.shell {
		container-type: inline-size;
		block-size: 100%;
	}
	.app {
		display: grid;
		grid-template-columns: var(--ui-sidebar-w) minmax(0, 1fr);
		block-size: 100%;
		min-block-size: 0;
		color: var(--ui-fg);
		font: var(--ui-sidebar-font)/1.4 var(--ui-font);
	}
	.app.collapsed {
		grid-template-columns: 3.75rem minmax(0, 1fr);
	}
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-inline-size: 0;
		padding: 0.75rem 0.5rem;
		overflow: hidden;
		border-inline-end: 1px solid var(--ui-sidebar-line);
		background: var(--ui-sidebar-bg);
	}
	.head {
		padding: 0.25rem 0.375rem;
		overflow: hidden;
		white-space: nowrap;
	}
	/* Scrolls when it must, fading at the edges so it's plainly scrollable. */
	nav {
		position: relative;
		flex: 1;
		min-block-size: 0;
		overflow: auto;
		scrollbar-width: none;
	}
	.group {
		margin: 0.75rem 0 0.25rem;
		padding-inline: 0.625rem;
		overflow: hidden;
		color: var(--ui-muted);
		font-size: var(--ui-sidebar-title-font);
		font-weight: 500;
		white-space: nowrap;
		transition: opacity 150ms ease;
	}
	/* minmax(0, 1fr): the column may shrink to the rail; auto would grow to the hidden labels. */
	ul {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.item,
	.fold {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		box-sizing: border-box;
		inline-size: 100%;
		min-block-size: var(--ui-sidebar-item-h);
		margin: 0;
		padding: 0 0.625rem;
		border: 0;
		border-radius: var(--ui-radius);
		background: none;
		color: var(--ui-muted);
		font: inherit;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition: color var(--ui-dur) ease;
	}
	/* Icon only; the tooltip names it. */
	.fold {
		justify-content: center;
		inline-size: var(--ui-sidebar-item-h);
		padding: 0;
	}
	.item :global(svg),
	.fold :global(svg) {
		flex: none;
	}
	.item:hover,
	.fold:hover {
		color: var(--ui-fg);
	}
	.item[aria-current='page'] {
		color: var(--ui-sidebar-current-fg);
		font-weight: 500;
	}
	.item:focus-visible,
	.fold:focus-visible,
	.menu:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	/* Labels fade out as it collapses; the icons stay put. */
	/* min-inline-size: 0 lets a long name shrink and truncate; a flex item won't by default. */
	.text {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: opacity 150ms ease;
	}
	.badge {
		margin-inline-start: auto;
		padding: 0 0.4375rem;
		border-radius: 999px;
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		font-size: 0.75rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		line-height: 1.25rem;
	}
	.collapsed .text,
	.collapsed .badge,
	.collapsed .group {
		opacity: 0;
	}
	.collapsed .group {
		block-size: 0.5rem;
		margin: 0.5rem 0;
	}
	/* Two pills glide between items: the current page's (tinted), and the pointer's. */
	.pill {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		border-radius: var(--ui-radius);
		opacity: 0;
		pointer-events: none;
		transition: opacity 120ms ease;
	}
	.pill.current {
		background: var(--ui-sidebar-current-bg);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
	}
	.pill.hover {
		background: var(--ui-hover);
	}
	.foot {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.25rem;
	}
	.main {
		min-inline-size: 0;
		overflow: auto;
	}
	/* Pinned while the content scrolls, so the menu is always one tap away. */
	.bar {
		position: sticky;
		inset-block-start: 0;
		z-index: 4;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-block-size: 3.25rem;
		box-sizing: border-box;
		padding: 0.25rem;
		border-block-end: 1px solid var(--ui-sidebar-line);
		background: color-mix(in srgb, var(--ui-bg) 92%, transparent);
		backdrop-filter: blur(12px);
	}
	.bar:not(.top),
	.menu,
	.bar-head {
		display: none;
	}
	.bar .fold {
		inline-size: 2.25rem;
		padding: 0;
		justify-content: center;
	}
	@media (pointer: coarse) {
		.bar .fold {
			inline-size: 2.75rem;
			min-block-size: 2.75rem;
		}
	}
	.bar-top {
		flex: 1;
		min-inline-size: 0;
	}
	.menu {
		place-items: center;
		inline-size: 2.75rem;
		block-size: 2.75rem;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--ui-radius);
		background: none;
		color: var(--ui-fg);
		cursor: pointer;
	}
	.bar .bar-head {
		min-inline-size: 0;
		font-weight: 600;
	}
	.sheet-foot {
		display: grid;
		gap: 1rem;
		margin-block-start: 1rem;
	}
	.sheet-nav ul {
		margin-block-end: 0.5rem;
	}
	/* Narrow: no sidebar; a menu button opens the same links in a sheet. */
	@container (max-width: 40rem) {
		.app,
		.app.collapsed {
			grid-template-columns: minmax(0, 1fr);
		}
		.sidebar,
		.bar .fold {
			display: none;
		}
		.bar:not(.top) {
			display: flex;
		}
		.bar {
			block-size: 3.25rem;
		}
		.menu {
			display: grid;
		}
		.bar-head {
			display: block;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.text,
		.group {
			transition: none;
		}
	}
</style>
