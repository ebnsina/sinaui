<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DocsLayout from '#lib/blocks/docs/DocsLayout.svelte';
	import { href, markdownHref, product, root, sections } from './content.js';

	let { children } = $props();
</script>

<DocsLayout
	name={product}
	{sections}
	current={page.url.pathname}
	home={root}
	action={{ label: 'Dashboard', href: href('') }}
	onnavigate={(to) => goto(to)}
>
	{#snippet logo()}
		<span class="mark" aria-hidden="true">W</span>
		{product}
	{/snippet}
	{#snippet footer()}
		{product} documentation, a Sina UI demo.
		<a href={markdownHref(page.params.page ?? '')} data-sveltekit-reload>This page as Markdown</a>
	{/snippet}
	{@render children()}
</DocsLayout>

<style>
	.mark {
		display: grid;
		place-items: center;
		inline-size: 1.5rem;
		block-size: 1.5rem;
		border-radius: calc(var(--ui-radius) * 0.75);
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		font-size: 0.8125rem;
	}
</style>
