<script lang="ts" module>
	export interface DocsNavItem {
		label: string;
		href: string;
		/** A short word beside the name, such as "Soon" or "New". */
		badge?: string;
	}
	export interface DocsNavGroup {
		/** Shown as a small uppercase label above the group. */
		title?: string;
		items: DocsNavItem[];
	}
</script>

<script lang="ts">
	import { glide } from './glide';

	interface Props {
		/** Names the navigation ("Documentation"). */
		label: string;
		groups: DocsNavGroup[];
		/** href of the page being shown. */
		current?: string;
		/** Called when a page is chosen (the link still navigates), e.g. to close a sheet. */
		onselect?: (item: DocsNavItem) => void;
		class?: string;
	}

	let { label, groups, current, onselect, class: className }: Props = $props();

	const id = $props.id();
	let hover = $state<HTMLSpanElement>();
</script>

<nav
	class={['docs-nav', className]}
	aria-label={label}
	onpointerover={(e) => {
		if (e.pointerType === 'touch' || !hover) return;
		const a = (e.target as Element).closest<HTMLElement>('a');
		glide(hover, a?.hasAttribute('aria-current') ? null : a, true);
	}}
	onpointerleave={() => hover && glide(hover, null, false)}
>
	<span class="hover" aria-hidden="true" bind:this={hover}></span>
	{#each groups as group, g (g)}
		<div class="group">
			{#if group.title}<p class="title" id="{id}-{g}">{group.title}</p>{/if}
			<ul aria-labelledby={group.title ? `${id}-${g}` : undefined}>
				{#each group.items as item (item.href)}
					<li>
						<a
							href={item.href}
							aria-current={item.href === current ? 'page' : undefined}
							onclick={() => onselect?.(item)}
						>
							<span>{item.label}</span>
							{#if item.badge}<span class="badge">{item.badge}</span>{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>

<style>
	.docs-nav {
		position: relative;
		display: grid;
		gap: 1.5rem;
		color: var(--ui-fg);
		font: var(--ui-sidebar-font)/1.4 var(--ui-font);
	}
	.title {
		margin: 0 0 0.375rem;
		padding-inline: 0.625rem;
		color: var(--ui-muted);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	ul {
		display: grid;
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	a {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		min-block-size: 2rem;
		padding: 0.3125rem 0.625rem;
		box-sizing: border-box;
		border-radius: var(--ui-radius-control);
		color: var(--ui-muted);
		text-decoration: none;
		transition: color var(--ui-dur) ease;
	}
	a:hover {
		color: var(--ui-fg);
	}
	a[aria-current] {
		background: var(--ui-sidebar-current-bg);
		color: var(--ui-sidebar-current-fg);
		font-weight: 500;
	}
	a:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.badge {
		flex: none;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 400;
	}
	/* One highlight that glides under the pointer, like the sidebar's. */
	.hover {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
		opacity: 0;
		pointer-events: none;
		transform-origin: 0 0;
		transition: opacity var(--ui-dur) ease;
	}
	@media (pointer: coarse) {
		a {
			min-block-size: var(--ui-control-h-touch);
		}
	}
</style>
