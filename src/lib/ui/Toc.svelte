<script lang="ts" module>
	export interface TocItem {
		/** The heading's id, so the link is `#id`. */
		id: string;
		label: string;
		/** 2 for a section, 3 for a subsection (indented under it). */
		level?: 2 | 3;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { ease, reduced } from './motion';

	interface Props {
		items: TocItem[];
		/** Title above the links, and the navigation's name. */
		label?: string;
		/** Height of anything fixed over the top of the page (a sticky header), in px. */
		offset?: number;
		/** id of the section being read; follows the scroll. */
		current?: string;
		class?: string;
	}

	let {
		items,
		label = 'On this page',
		offset = 0,
		current = $bindable(),
		class: className
	}: Props = $props();

	const id = $props.id();
	let list = $state<HTMLOListElement>();
	let thumb = $state<HTMLSpanElement>();
	let placed = false;

	// What scrolls the headings: the page, or a panel they sit in.
	function scroller(el: Element | null): Element {
		for (let p = el?.parentElement; p && p !== document.body; p = p.parentElement) {
			const { overflowY } = getComputedStyle(p);
			if (/(auto|scroll)/.test(overflowY) && p.scrollHeight > p.clientHeight) return p;
		}
		return document.scrollingElement ?? document.documentElement;
	}

	// The section being read is the last whose heading has passed a line a little below the header;
	// at the very bottom it's the last one, which may be too short to ever reach that line.
	function spy() {
		const els = items.map((item) => document.getElementById(item.id));
		const box = scroller(els.find(Boolean) ?? null);
		const page = box === document.scrollingElement || box === document.documentElement;
		const line = (page ? 0 : box.getBoundingClientRect().top) + offset + 16;
		const bottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 2;
		let found = items[0]?.id;
		items.forEach((item, i) => {
			if (els[i] && els[i].getBoundingClientRect().top <= line) found = item.id;
		});
		current = bottom && box.scrollTop > 0 && items.length ? items[items.length - 1].id : found;
	}

	onMount(() => {
		let frame = 0;
		const onscroll = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(spy);
		};
		spy();
		// Captured, so a scrolling panel is heard as well as the page.
		addEventListener('scroll', onscroll, { passive: true, capture: true });
		addEventListener('resize', onscroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			removeEventListener('scroll', onscroll, { capture: true });
			removeEventListener('resize', onscroll);
		};
	});

	// New headings (another page) are read again.
	$effect(() => {
		void items;
		spy();
	});

	// The thumb on the rail slides to the current link with FLIP (transform only); it snaps the first time.
	$effect(() => {
		// By href, not aria-current: this can run before the link's attribute is updated.
		const link = current
			? list?.querySelector<HTMLElement>(`a[href="#${CSS.escape(current)}"]`)
			: null;
		if (!thumb) return;
		if (!link) {
			thumb.style.opacity = '0';
			return;
		}
		const from = thumb.style.opacity === '1' ? thumb.offsetTop : null;
		const fromH = thumb.offsetHeight;
		const top = link.offsetTop;
		const height = link.offsetHeight;
		thumb.style.insetBlockStart = `${top}px`;
		thumb.style.blockSize = `${height}px`;
		thumb.style.opacity = '1';
		if (!placed || from === null || reduced() || !fromH) {
			placed = true;
			return;
		}
		thumb.animate(
			[
				{ transform: `translateY(${from - top}px) scaleY(${fromH / height})` },
				{ transform: 'none' }
			],
			{ duration: 200, easing: ease.standard }
		);
	});
</script>

{#if items.length}
	<nav class={['toc', className]} aria-labelledby="{id}-title">
		<p id="{id}-title" class="title">{label}</p>
		<div class="rail">
			<span class="thumb" aria-hidden="true" bind:this={thumb}></span>
			<ol bind:this={list}>
				{#each items as item (item.id)}
					<li class:sub={item.level === 3}>
						<a
							href="#{item.id}"
							aria-current={item.id === current ? 'location' : undefined}
							onclick={() => (current = item.id)}>{item.label}</a
						>
					</li>
				{/each}
			</ol>
		</div>
	</nav>
{/if}

<style>
	.toc {
		color: var(--ui-fg);
		font: 0.8125rem/1.45 var(--ui-font);
	}
	.title {
		margin: 0 0 0.625rem;
		color: var(--ui-fg);
		font-weight: 500;
	}
	.rail {
		position: relative;
		box-shadow: inset 1px 0 var(--ui-line);
	}
	.thumb {
		position: absolute;
		inset-inline-start: 0;
		inset-block-start: 0;
		inline-size: 2px;
		margin-inline-start: -0.5px;
		border-radius: 1px;
		background: var(--ui-fg);
		opacity: 0;
		transform-origin: 0 0;
		transition: opacity var(--ui-dur) ease;
	}
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	a {
		display: block;
		padding: 0.25rem 0 0.25rem 0.875rem;
		color: var(--ui-muted);
		text-decoration: none;
		overflow-wrap: anywhere;
		transition: color var(--ui-dur) ease;
	}
	.sub a {
		padding-inline-start: 1.625rem;
	}
	a:hover,
	a[aria-current] {
		color: var(--ui-fg);
	}
	a:focus-visible {
		border-radius: var(--ui-radius-control);
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	@media (prefers-reduced-motion: reduce) {
		.thumb {
			transition: none;
		}
	}
</style>
