<script lang="ts">
	import type { Home01Icon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
		title?: string;
		description?: string;
		/** Beside the title, to tell sections apart at a glance (settings, reports). Decorative. */
		icon?: typeof Home01Icon;
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
		/** danger: a red edge and title, for actions that can't be undone (a "Danger zone"). */
		tone?: 'danger';
	}

	let {
		title,
		description,
		icon,
		level = 3,
		href,
		aside,
		children,
		footer,
		flush = false,
		selected = false,
		tone,
		class: className,
		...rest
	}: Props = $props();
</script>

<!-- A flat bordered panel: title, content and actions inside it.
     With href, the title's link stretches over the whole card, so screen readers hear one name. -->
<article
	class={[
		'card',
		href && 'linked',
		icon && title && 'has-icon',
		selected && 'selected',
		tone === 'danger' && 'danger',
		className
	]}
	{...rest}
>
	<div class="sheet">
		{#if title || aside}
			<div class="head">
				{#if title}
					<div class={['heading', icon && 'with-icon']}>
						{#if icon}<span class="icon"><Icon {icon} size={18} /></span>{/if}
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
	</div>
	{#if footer}<div class="footer">{@render footer()}</div>{/if}
</article>

<style>
	.card {
		position: relative;
		/* Its own layer, so the outer ring (z-index -1) paints behind the card, not behind the page. */
		isolation: isolate;
		box-sizing: border-box;
		/* a column, so a card stretched to its row's height keeps its footer on the bottom edge */
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
		/* A tinted frame with a hairline outline. The sheet inside lies on the frame's edge, so their
		   lines merge; the footer stays on the frame's tint below it; a faint ring sits 3px outside. */
		border: 1px solid var(--ui-card-line, var(--ui-line));
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		box-shadow: var(--ui-card-shadow, 0 1px 2px light-dark(rgb(0 0 0 / 0.04), transparent));
		color: var(--ui-fg);
		font: var(--ui-font-size)/1.5 var(--ui-font);
	}
	/* The sheet's line lies on the frame's, so edge colors go on both. */
	.danger,
	.danger .sheet {
		border-color: color-mix(in oklab, var(--ui-danger) 45%, var(--ui-field-line));
	}
	.danger .title {
		color: var(--ui-danger);
	}
	.selected,
	.selected .sheet {
		border-color: var(--ui-fg);
		box-shadow: inset 0 0 0 1px var(--ui-fg);
	}
	.card::after {
		content: '';
		position: absolute;
		inset: -3px;
		z-index: -1;
		border: 1px solid color-mix(in oklab, var(--ui-card-line, var(--ui-line)) 64%, transparent);
		border-radius: var(--ui-radius);
		pointer-events: none;
	}
	.sheet {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-inline-size: 0;
		/* Pulled onto the frame's border, so the two hairlines are one line. */
		margin: -1px -1px 0;
		border: 1px solid var(--ui-card-line, var(--ui-line));
		border-radius: var(--ui-radius);
		background: var(--ui-bg);
	}
	.sheet:last-child {
		margin-block-end: -1px;
	}
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1rem 0;
	}
	/* A card that's only a header (a link card) keeps the same space below as at its sides. */
	.head:last-child {
		padding-block-end: 1rem;
	}
	.heading {
		min-inline-size: 0;
	}
	/* The icon sits on the title's line; the description lines up under the title, not the icon. */
	.with-icon {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		column-gap: 0.5rem;
	}
	.with-icon > :not(.icon) {
		grid-column: 2;
	}
	/* The body and footer share the title's column, so the text runs down one edge under the icon. */
	.has-icon {
		--indent: calc(18px + 0.5rem);
	}
	.has-icon .panel:not(.flush) {
		padding-inline-start: calc(1rem + var(--indent));
	}
	.has-icon > .footer {
		padding-inline-start: calc(1rem + var(--indent));
	}
	.icon {
		display: flex;
		align-items: center;
		block-size: calc(var(--ui-font-size) * 1.5);
		color: var(--ui-card-icon, var(--ui-muted));
	}
	.title {
		margin: 0;
		font-family: var(--ui-font-heading);
		font-size: var(--ui-font-size);
		font-weight: 500;
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
	.linked,
	.linked .sheet {
		transition: border-color var(--ui-dur-press) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		.linked:hover,
		.linked:hover .sheet {
			border-color: color-mix(in srgb, var(--ui-fg) 22%, transparent);
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
		padding: 1rem;
	}
	.head + .panel {
		padding-block-start: 0.75rem;
	}
	.head + .flush {
		padding-block-start: 0;
		margin-block-start: 1rem;
		border-block-start: 1px solid var(--ui-line);
		border-start-start-radius: 0;
		border-start-end-radius: 0;
	}
	.flush {
		gap: 0;
		overflow: hidden;
		padding: 0;
		border-radius: var(--ui-radius);
	}
	/* Actions sit at the end, main action last; wrapping keeps it on the bottom row, like Dialog.
	   On the frame's tint, below the sheet. */
	.footer {
		display: flex;
		flex-wrap: wrap-reverse;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
	}
	/* Controls inside a linked card stay clickable above the stretched link. */
	.linked :is(.panel, .footer) :global(:is(a, button, input, select, textarea, label)) {
		position: relative;
		z-index: 1;
	}
</style>
