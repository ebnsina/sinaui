<script lang="ts">
	import { ease, reduced } from '../motion';
	import { springAt } from '../spring';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTabs } from './context';
	import { glide } from '../glide';
	import { scrollEdges } from '../scroll-edges';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Names the tab set, e.g. "Account settings". Or pass aria-labelledby. */
		label?: string;
		children: Snippet;
	}

	let { label, children, class: className, ...rest }: Props = $props();
	const tabs = getTabs();
	const vertical = $derived(tabs.orientation === 'vertical');
	let list: HTMLDivElement;
	let bar: HTMLSpanElement;
	let hover: HTMLSpanElement;
	let capL = $state<HTMLSpanElement>();
	let mid = $state<HTMLSpanElement>();
	let capR = $state<HTMLSpanElement>();
	const folder = $derived(tabs.variant === 'folder' && !vertical);
	let ready = $state(false);
	// First placement and keyboard moves snap; only pointer changes animate.
	let fromPointer = false;

	const enabled = () => [...list.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)')];

	// FLIP: jump the bar to its final box, then ease a transform from where it visually was.
	// Only transform animates, so the slide runs on the compositor and ends pixel-exact.
	function place(animate = false) {
		const t = list.querySelector<HTMLElement>('[aria-selected="true"]');
		if (!t) return;
		if (folder) return placeFolder(t, animate);
		const v = vertical;
		const was = new DOMMatrix(getComputedStyle(bar).transform);
		const wasPos = v ? was.f : was.e;
		const wasSize = (v ? was.d : was.a) * (v ? bar.offsetHeight : bar.offsetWidth);

		const pos = v ? t.offsetTop : t.offsetLeft;
		const size = v ? t.offsetHeight : t.offsetWidth;
		const to = v ? `translateY(${pos}px)` : `translateX(${pos}px)`;
		for (const a of bar.getAnimations()) a.cancel();
		bar.style.transform = to;
		bar.style.width = v ? '' : `${size}px`;
		bar.style.height = v ? `${size}px` : '';

		const moved = ready && (wasPos !== pos || wasSize !== size);
		ready = true;
		if (!animate || !moved || reduced()) return;
		const from = v
			? `translateY(${wasPos}px) scaleY(${wasSize / size})`
			: `translateX(${wasPos}px) scaleX(${wasSize / size})`;
		// Moving on screen: strong ease-in-out, under the 300ms UI budget.
		bar.animate([{ transform: from }, { transform: to }], {
			duration: 220,
			easing: ease.inOut
		});
	}

	// Folder: two caps (rounded top corner and the curve into the panel) and a middle strip that
	// stretches between them. Edges move separately, the leading one first, so the shape stretches
	// toward the new tab and settles on a spring. Transforms only, sampled into keyframes.
	const settle = springAt(0.15);
	const edges = () => {
		const c = capL!.offsetWidth;
		return {
			l: new DOMMatrix(getComputedStyle(capL!).transform).e,
			r: new DOMMatrix(getComputedStyle(capR!).transform).e + c
		};
	};
	const frame = (l: number, r: number, c: number) => ({
		l: `translateX(${l}px)`,
		m: `translateX(${l + c}px) scaleX(${Math.max(0, r - l - 2 * c)})`,
		r: `translateX(${r - c}px)`
	});

	function placeFolder(t: HTMLElement, animate: boolean) {
		if (!capL || !mid || !capR) return;
		const c = capL.offsetWidth;
		const from = edges();
		const to = { l: t.offsetLeft, r: t.offsetLeft + t.offsetWidth };
		for (const el of [capL, mid, capR]) for (const a of el.getAnimations()) a.cancel();
		const end = frame(to.l, to.r, c);
		capL.style.transform = end.l;
		mid.style.transform = end.m;
		capR.style.transform = end.r;

		const moved = ready && (from.l !== to.l || from.r !== to.r);
		ready = true;
		if (!animate || !moved || reduced()) return;
		const right = to.l > from.l;
		const steps = Array.from({ length: 33 }, (_, i) => {
			const t = i / 32;
			const lead = settle(t);
			const trail = settle(Math.max(0, (t - 0.14) / 0.86));
			const l = from.l + (to.l - from.l) * (right ? trail : lead);
			const r = from.r + (to.r - from.r) * (right ? lead : trail);
			return frame(l, r, c);
		});
		const opts = { duration: 520, easing: 'linear' };
		capL.animate(
			steps.map((f) => ({ transform: f.l })),
			opts
		);
		mid.animate(
			steps.map((f) => ({ transform: f.m })),
			opts
		);
		capR.animate(
			steps.map((f) => ({ transform: f.r })),
			opts
		);
	}

	// A stale value (matches no tab) would leave the list unreachable by Tab key: fall back to the first.
	$effect(() => {
		void [tabs.value, tabs.orientation];
		if (!list.querySelector('[aria-selected="true"]')) enabled()[0]?.click();
		place(fromPointer);
	});

	// Tab widths change when the web font loads, labels change, or the viewport resizes.
	$effect(() => {
		const ro = new ResizeObserver(() => place());
		for (const tab of list.querySelectorAll('[role="tab"]')) ro.observe(tab);
		return () => ro.disconnect();
	});

	function onkeydown(e: KeyboardEvent) {
		const items = enabled();
		const i = items.indexOf(e.target as HTMLElement);
		if (i < 0) return;

		const vertical = tabs.orientation === 'vertical';
		const rtl = getComputedStyle(list).direction === 'rtl';
		const next = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
		const prev = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
		const n = items.length;
		const target = {
			[next]: items[(i + 1) % n],
			[prev]: items[(i - 1 + n) % n],
			Home: items[0],
			End: items[n - 1]
		}[e.key];
		if (!target) return;

		e.preventDefault();
		fromPointer = false;
		target.focus();
		if (tabs.activation === 'automatic') target.click();
	}
</script>

<div
	bind:this={list}
	{@attach scrollEdges}
	data-fade={tabs.orientation === 'vertical' ? 'y' : 'x'}
	role="tablist"
	aria-label={label}
	aria-orientation={tabs.orientation}
	data-ready={ready ? '' : undefined}
	class={['list', folder && 'folder', className]}
	{...rest}
	onpointerdown={(e) => {
		fromPointer = true;
		rest.onpointerdown?.(e);
	}}
	onkeydown={(e) => {
		onkeydown(e);
		rest.onkeydown?.(e);
	}}
	onpointerover={(e) => {
		// Hover underline glides between tabs (mouse only: touch has no hover, keyboard has the focus ring).
		if (e.pointerType === 'touch') return;
		const tab = (e.target as Element).closest<HTMLElement>('[role="tab"]:not(:disabled)');
		if (tab) glide(hover, tab, true);
		rest.onpointerover?.(e);
	}}
	onpointerleave={(e) => {
		glide(hover, null, false);
		rest.onpointerleave?.(e);
	}}
>
	<span bind:this={hover} class="hover" aria-hidden="true"></span>
	{@render children()}
	<!-- One underline (or, as a folder, one raised tab) that slides and resizes to the selected tab. -->
	<span bind:this={bar} class="bar" aria-hidden="true">
		{#if folder}
			<span bind:this={capL} class="cap l"></span>
			<span bind:this={mid} class="mid"></span>
			<span bind:this={capR} class="cap r"></span>
		{/if}
	</span>
</div>

<style>
	.list {
		position: relative;
		display: flex;
		gap: 0.25rem;
		box-shadow: inset 0 -1px var(--ui-field-line);
		/* Narrow screens scroll instead of wrapping; focus() scrolls the active tab into view. */
		overflow-x: auto;
		scrollbar-width: none;
	}
	.list[aria-orientation='vertical'] {
		flex-direction: column;
		flex: none;
		box-shadow: inset -1px 0 var(--ui-field-line);
		overflow: visible;
	}
	.list[aria-orientation='vertical']:dir(rtl) {
		box-shadow: inset 1px 0 var(--ui-field-line);
	}

	/* Hover: the same underline as the selected tab, in a neutral gray, gliding between tabs. */
	.hover {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		opacity: 0;
		pointer-events: none;
		transition: opacity 150ms ease;
	}
	.hover::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		block-size: 3px;
		border-radius: 3px 3px 0 0;
		background: color-mix(in srgb, var(--ui-muted) 45%, transparent);
	}
	/* Vertical: on the inline-end edge, like the selected bar, so both mirror right to left. */
	[aria-orientation='vertical'] > .hover::after {
		inset-block: 0;
		inset-inline: auto 0;
		inline-size: 3px;
		block-size: auto;
		border-radius: 0;
		border-start-start-radius: 3px;
		border-end-start-radius: 3px;
	}
	.bar {
		position: absolute;
		inset-block-end: 0;
		left: 0;
		block-size: 3px;
		border-radius: 3px 3px 0 0;
		background: var(--ui-accent);
		transform-origin: 0 0;
		pointer-events: none;
	}
	[aria-orientation='vertical'] > .bar {
		inset-block: 0 auto;
		inset-inline: auto 0;
		inline-size: 3px;
		border-radius: 0;
		border-start-start-radius: 3px;
		border-end-start-radius: 3px;
	}
	.list:not([data-ready]) > .bar {
		display: none;
	}
	/* Folder: the chosen tab is a raised piece of the panel's fill, curving into it at the bottom. */
	.folder {
		--curve: 0.75rem;
		isolation: isolate;
		/* The outer curves land on the panel's straight top edge, past its rounded corners. */
		padding-inline: calc(var(--ui-radius) + var(--curve));
		box-shadow: none;
	}
	.folder > .hover {
		display: none;
	}
	.folder > .bar {
		inset: 0 auto 0 0;
		inline-size: 0;
		block-size: auto;
		border-radius: 0;
		background: none;
		z-index: -1;
	}
	.cap,
	.mid {
		position: absolute;
		inset-block: 0;
		left: 0;
		background: var(--ui-subtle);
	}
	.cap {
		inline-size: var(--curve);
	}
	.mid {
		inline-size: 1px;
		transform-origin: 0 0;
	}
	.cap.l {
		border-top-left-radius: var(--curve);
	}
	.cap.r {
		border-top-right-radius: var(--curve);
	}
	.cap::before {
		content: '';
		position: absolute;
		bottom: 0;
		inline-size: var(--curve);
		block-size: var(--curve);
	}
	.cap.l::before {
		right: 100%;
		background: radial-gradient(
			circle at 0 0,
			transparent var(--curve),
			var(--ui-subtle) calc(var(--curve) + 0.5px)
		);
	}
	.cap.r::before {
		left: 100%;
		background: radial-gradient(
			circle at 100% 0,
			transparent var(--curve),
			var(--ui-subtle) calc(var(--curve) + 0.5px)
		);
	}
	@media (forced-colors: active) {
		.bar {
			forced-color-adjust: none;
			background: Highlight;
		}
	}
</style>
