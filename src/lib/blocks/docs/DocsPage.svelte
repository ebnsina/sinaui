<script lang="ts">
	import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import Breadcrumb from '#lib/ui/Breadcrumb.svelte';
	import CopyButton from '#lib/ui/CopyButton.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Toc, { type TocItem } from '#lib/ui/Toc.svelte';
	import { scrollEdges } from '#lib/ui/scroll-edges.js';

	type Link = { label: string; href: string };

	interface Props {
		title: string;
		/** The lede under the title. */
		description?: string;
		/** Where the page sits, top level first; the last is this page. */
		crumbs?: { label: string; href?: string }[];
		/** The page's Markdown source, or a function that loads it: shows "Copy page as Markdown". */
		markdown?: string | (() => string | Promise<string>);
		/** The page as Markdown at its own address (often the URL plus ".md"): shows "View as Markdown". */
		markdownHref?: string;
		/** The headings in the content, for "On this page". */
		toc?: TocItem[];
		prev?: Link;
		next?: Link;
		/** The content, styled as prose: give its h2 and h3 the ids used in `toc`. */
		children: Snippet;
	}

	let {
		title,
		description,
		crumbs,
		markdown,
		markdownHref,
		toc = [],
		prev,
		next,
		children
	}: Props = $props();

	// The copy button only says it failed; the reason goes to the console.
	async function source() {
		try {
			return typeof markdown === 'function' ? await markdown() : (markdown ?? '');
		} catch (e) {
			console.error(`Copy page as Markdown: the source for "${title}" failed to load`, e);
			throw e;
		}
	}
</script>

<div class={['docs-page', !toc.length && 'no-toc']}>
	<article>
		{#if crumbs?.length}
			<div class="crumbs"><Breadcrumb label="You are here" items={crumbs} /></div>
		{/if}
		<h1>{title}</h1>
		{#if description}<p class="lede">{description}</p>{/if}
		{#if markdown !== undefined || markdownHref}
			<div class="actions">
				{#if markdown !== undefined}
					<CopyButton value={source} variant="ghost" size="sm">Copy page as Markdown</CopyButton>
				{/if}
				{#if markdownHref}<a class="md" href={markdownHref} data-sveltekit-reload
						>View as Markdown</a
					>{/if}
			</div>
		{/if}
		<div class="prose">{@render children()}</div>
		{#if prev || next}
			<nav class="pager" aria-label="Previous and next page">
				{#if prev}
					<a class="prev" href={prev.href} rel="prev">
						<span class="dir"><Icon icon={ArrowLeft01Icon} size={14} /> Previous</span>
						<span class="name">{prev.label}</span>
					</a>
				{/if}
				{#if next}
					<a class="next" href={next.href} rel="next">
						<span class="dir">Next <Icon icon={ArrowRight01Icon} size={14} /></span>
						<span class="name">{next.label}</span>
					</a>
				{/if}
			</nav>
		{/if}
	</article>
	{#if toc.length}
		<div class="toc" {@attach scrollEdges} data-fade><Toc items={toc} offset={72} /></div>
	{/if}
</div>

<style>
	.docs-page {
		display: grid;
		grid-template-columns: minmax(0, 46rem) 13rem;
		justify-content: center;
		gap: 4rem;
		padding: 2.5rem 2.5rem 5rem;
	}
	.no-toc {
		grid-template-columns: minmax(0, 46rem);
	}
	article {
		min-inline-size: 0;
	}
	.crumbs {
		margin-block-end: 1rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	h1 {
		margin: 0;
		font-size: clamp(1.875rem, 1.4rem + 1.5vw, 2.25rem);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.15;
		text-wrap: balance;
	}
	.lede {
		margin: 0.75rem 0 0;
		color: var(--ui-muted);
		font-size: 1.125rem;
		line-height: 1.6;
		text-wrap: pretty;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 1rem;
		margin: 1rem 0 0 -0.5rem;
		font-size: 0.875rem;
	}
	.md {
		color: var(--ui-muted);
	}
	.md:hover {
		color: var(--ui-fg);
	}
	.md:focus-visible,
	.pager a:focus-visible {
		border-radius: var(--ui-radius-control);
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}

	/* The content: about 68 characters a line at 1rem in a 46rem column. */
	.prose {
		margin-block-start: 2rem;
		font-size: 1rem;
		line-height: 1.7;
	}
	.prose > :global(:first-child) {
		margin-block-start: 0;
	}
	.prose :global(:is(h2, h3, h4)) {
		scroll-margin-block-start: calc(var(--docs-bar-h, 0px) + 1.5rem);
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.3;
		text-wrap: balance;
	}
	.prose :global(h2) {
		margin: 3rem 0 0.75rem;
		font-size: 1.5rem;
	}
	.prose :global(h3) {
		margin: 2.25rem 0 0.5rem;
		font-size: 1.1875rem;
	}
	.prose :global(h4) {
		margin: 1.75rem 0 0.5rem;
		font-size: 1rem;
	}
	.prose :global(:is(p, ul, ol, blockquote)) {
		margin: 0 0 1rem;
	}
	.prose :global(:is(ul, ol)) {
		padding-inline-start: 1.5rem;
	}
	.prose :global(li + li) {
		margin-block-start: 0.375rem;
	}
	.prose :global(a) {
		color: var(--ui-fg);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--ui-fg) 35%, transparent);
		text-underline-offset: 0.2em;
	}
	.prose :global(a:hover) {
		text-decoration-color: currentColor;
	}
	.prose :global(strong) {
		font-weight: 600;
	}
	.prose :global(:not(pre) > code) {
		padding: 0.125em 0.375em;
		border-radius: 0.375rem;
		background: var(--ui-subtle);
		font-family: var(--ui-font-mono);
		font-size: 0.875em;
		overflow-wrap: anywhere;
	}
	.prose :global(hr) {
		block-size: 1px;
		margin: 2.5rem 0;
		border: 0;
		box-shadow: inset 0 1px var(--ui-line);
	}
	.prose :global(blockquote) {
		padding-inline-start: 1rem;
		box-shadow: inset 2px 0 var(--ui-line);
		color: var(--ui-muted);
	}
	.prose :global(table) {
		display: block;
		max-inline-size: 100%;
		margin: 0 0 1.25rem;
		overflow-x: auto;
		border-collapse: collapse;
		font-size: 0.875rem;
		line-height: 1.5;
	}
	.prose :global(th) {
		color: var(--ui-muted);
		font-weight: 500;
		text-align: start;
	}
	.prose :global(:is(th, td)) {
		padding: 0.5rem 1rem 0.5rem 0;
		vertical-align: top;
		box-shadow: inset 0 -1px var(--ui-line);
	}
	.prose > :global(:is(.codeblock, .code-tabs, .alert)) {
		margin-block-end: 1.25rem;
	}

	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-block-start: 4rem;
		padding-block-start: 1.5rem;
		box-shadow: inset 0 1px var(--ui-line);
	}
	.pager a {
		display: grid;
		gap: 0.25rem;
		padding: 0.75rem 0;
		color: var(--ui-fg);
		text-decoration: none;
	}
	.next {
		grid-column: 2;
		justify-items: end;
		text-align: end;
	}
	.dir {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.name {
		font-weight: 500;
	}
	.pager a:hover .name {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.toc {
		position: sticky;
		inset-block-start: calc(var(--docs-bar-h, 0px) + 2.5rem);
		align-self: start;
		max-block-size: calc(100dvh - var(--docs-bar-h, 0px) - 4rem);
		overflow: auto;
	}
	@media (max-width: 75rem) {
		.docs-page {
			grid-template-columns: minmax(0, 46rem);
		}
		.toc {
			display: none;
		}
	}
	@media (max-width: 40rem) {
		.docs-page {
			padding: 1.5rem 1rem 4rem;
		}
		.pager {
			grid-template-columns: 1fr;
		}
		.next {
			grid-column: 1;
		}
	}
</style>
