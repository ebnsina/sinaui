<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDropdown } from './context';

	interface Props extends Omit<HTMLButtonAttributes, 'disabled' | 'onselect'> {
		variant?: 'default' | 'danger';
		/** Stays focusable (so it's announced) but can't be chosen. */
		disabled?: boolean;
		/** Makes it a link (navigation, open in new tab) instead of an action. */
		href?: string;
		/** Runs when chosen by click, Enter or Space. Call preventDefault() to keep the menu open. */
		onselect?: (e: MouseEvent) => void;
		children: Snippet;
	}

	let {
		variant = 'default',
		disabled = false,
		href,
		onselect,
		children,
		class: className,
		...rest
	}: Props = $props();
	const dropdown = getDropdown();
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	type={href ? undefined : 'button'}
	href={disabled ? undefined : href}
	role="menuitem"
	tabindex="-1"
	aria-disabled={disabled || undefined}
	class={['item', variant, className]}
	{...rest}
	onkeydown={(e: KeyboardEvent) => {
		// Links answer Enter natively; Space chooses too, as for every menu item.
		if (href && e.key === ' ') {
			e.preventDefault();
			(e.currentTarget as HTMLElement).click();
		}
	}}
	onpointermove={(e: PointerEvent) => {
		// Pointer and keyboard share one highlight: whatever is focused.
		const el = e.currentTarget as HTMLElement;
		if (document.activeElement !== el) el.focus({ preventScroll: true });
	}}
	onclick={(e: MouseEvent) => {
		if (disabled) return;
		onselect?.(e);
		if (!e.defaultPrevented) dropdown.close();
	}}
>
	{@render children()}
</svelte:element>

<style>
	.item {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		inline-size: 100%;
		min-block-size: var(--ui-item-h);
		padding: 0 0.625rem;
		/* Invisible normally; outlines the item in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: var(--ui-radius);
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: start;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	@media (pointer: coarse) {
		.item {
			min-block-size: 2.75rem;
		}
	}
	/* The highlighted item's icon inks in and leans a step toward its label. */
	.item :global(svg) {
		flex: none;
		color: var(--ui-muted);
		transition:
			color var(--ui-dur-press) ease,
			translate var(--ui-dur) var(--ui-ease-out);
	}
	.item:focus :global(svg) {
		translate: 2px 0;
	}
	.item:focus:dir(rtl) :global(svg) {
		translate: -2px 0;
	}
	.item:focus:not(.danger) :global(svg) {
		color: var(--ui-fg);
	}
	.item:active :global(svg) {
		scale: 0.9;
	}
	@media (prefers-reduced-motion: reduce) {
		.item:is(:focus, :active, :focus:dir(rtl)) :global(svg) {
			translate: none;
			scale: none;
		}
	}
	/* The menu's gliding highlight marks the focused item; items stay transparent above it. */
	.item {
		position: relative;
	}
	.item:focus {
		outline: none;
	}
	.danger,
	.danger :global(svg) {
		color: var(--ui-danger);
	}
	.item[aria-disabled='true'] {
		opacity: 0.55;
		cursor: not-allowed;
	}
	@media (forced-colors: active) {
		.item:focus {
			outline: 2px solid Highlight;
		}
	}
</style>
