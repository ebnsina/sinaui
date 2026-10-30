<script lang="ts">
	import CodeTabs from '#lib/blocks/docs/CodeTabs.svelte';
	import DocsPage from '#lib/blocks/docs/DocsPage.svelte';
	import { locate } from '#lib/blocks/docs/docs.js';
	import { find, href, markdown, markdownHref, product, sections, toc } from '../content.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const doc = $derived(find(data.slug)!);
	const place = $derived(locate(sections, href(doc.slug)));
	// One pick for every code sample on the page.
	let lang = $state<string>();

	// `code` spans in the text.
	const parts = (text: string) => text.split('`').map((t, i) => ({ t, code: i % 2 === 1 }));
</script>

<svelte:head>
	<title>{doc.title} — {product} docs</title>
	<meta name="description" content={doc.description} />
	<meta property="og:title" content="{doc.title} — {product} docs" />
	<meta property="og:description" content={doc.description} />
</svelte:head>

{#snippet text(s: string)}{#each parts(s) as p, i (i)}{#if p.code}<code>{p.t}</code
			>{:else}{p.t}{/if}{/each}{/snippet}

<DocsPage
	title={doc.title}
	description={doc.description}
	crumbs={[
		{ label: place.section.label, href: place.section.href },
		...(place.group?.title ? [{ label: place.group.title }] : []),
		{ label: doc.title }
	]}
	markdown={markdown(doc)}
	markdownHref={markdownHref(doc.slug)}
	toc={toc(doc)}
	prev={place.prev}
	next={place.next}
>
	{#each doc.blocks as b, i (i)}
		{#if b.kind === 'h2'}
			<h2 id={b.id}>{b.text}</h2>
		{:else if b.kind === 'h3'}
			<h3 id={b.id}>{b.text}</h3>
		{:else if b.kind === 'p'}
			<p>{@render text(b.text)}</p>
		{:else if b.kind === 'list'}
			<ul>
				{#each b.items as item, j (j)}<li>{@render text(item)}</li>{/each}
			</ul>
		{:else}
			<CodeTabs samples={b.samples} bind:value={lang} />
		{/if}
	{/each}
</DocsPage>
