<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
		title?: string;
		description?: string;
		/** Heading level for the title, to fit the page's outline. */
		level?: 2 | 3 | 4;
		/** Makes the whole card a link; the title becomes the link text screen readers announce. */
		href?: string;
		/** Beside the title: a switch, a count, a link. */
		aside?: Snippet;
		children?: Snippet;
		footer?: Snippet;
		/** The panel's content runs edge to edge (a table, a list of rows). */
		flush?: boolean;
		/** Chosen from a set of cards. */
		selected?: boolean;
	}

	let {
		title,
		description,
		level = 3,
		href,
		aside,
		children,
		footer,
		flush = false,
		selected = false,
		class: className,
		...rest
	}: Props = $props();
</script>

<!-- A tinted frame: the title sits on the frame, the content on a panel inside it, actions below.
     With href, the title's link stretches over the whole card, so screen readers hear one name. -->
<article class={['card', href && 'linked', selected && 'selected', className]} {...rest}>
	{#if title || aside}
		<div class="head">
			{#if title}
				<div class="heading">
					<svelte:element this={`h${level}`} class="title">
						{#if href}<a {href}>{title}</a>{:else}{title}{/if}
					</svelte:element>
					{#if description}<p class="description">{description}</p>{/if}
				</div>
			{/if}
			{@render aside?.()}
		</div>
	{/if}
	{#if children}<div class={['panel', flush && 'flush']}>{@render children()}</div>{/if}
	{#if footer}<div class="footer">{@render footer()}</div>{/if}
</article>

<style>
	/* A light tint around a surface panel, 4px apart; corners nest (frame = panel + 4px). */
	.card {
		position: relative;
		box-sizing: border-box;
		display: grid;
		gap: 0.25rem;
		padding: 0.25rem;
		/* Invisible normally; outlines it in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) + 0.25rem);
		background: var(--ui-subtle);
		color: var(--ui-fg);
		font: var(--ui-font-size)/1.5 var(--ui-font);
	}
	.selected {
		background: var(--ui-hover);
		box-shadow: inset 0 0 0 1px var(--ui-fg);
	}
	/* Text on the frame lines up with text in the panel: the panel's padding plus its 1px edge. */
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.375rem calc(0.75rem + 1px) 0.25rem;
	}
	.heading {
		min-inline-size: 0;
	}
	.title {
		margin: 0;
		font-family: var(--ui-font-heading);
		font-size: var(--ui-font-size);
		font-weight: 600;
		letter-spacing: -0.01em;
	}
	.title a {
		color: inherit;
		text-decoration: none;
	}
	/* The link's hit area covers the whole card. */
	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}
	.linked:has(a:focus-visible) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.title a:focus-visible {
		outline: none;
	}
	.linked {
		transition: transform var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.linked:hover {
			transform: translateY(-2px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.linked:hover {
			transform: none;
		}
	}
	.description {
		margin: 0.125rem 0 0;
		color: var(--ui-muted);
	}
	.panel {
		display: grid;
		gap: 0.75rem;
		min-inline-size: 0;
		padding: 0.75rem;
		border: 1px solid var(--ui-line);
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
	}
	.flush {
		gap: 0;
		overflow: hidden;
		padding: 0;
	}
	/* Actions sit at the end, main action last; wrapping keeps it on the bottom row, like Dialog. */
	.footer {
		display: flex;
		flex-wrap: wrap-reverse;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.25rem calc(0.75rem + 1px) 0.25rem;
	}
	/* Controls inside a linked card stay clickable above the stretched link. */
	.linked :is(.panel, .footer) :global(:is(a, button, input, select, textarea, label)) {
		position: relative;
		z-index: 1;
	}
</style>
