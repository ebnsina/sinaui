<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Example from '#lib/site/Example.svelte';
	import { examples } from '#lib/site/examples.js';

	const ex = examples(
		import.meta.glob<Component>('./examples/*.svelte', { eager: true, import: 'default' }),
		import.meta.glob<string>('./examples/*.svelte', {
			eager: true,
			query: '?raw',
			import: 'default'
		})
	);
</script>

<svelte:head>
	<title>Table of contents — Sina UI</title>
	<meta
		name="description"
		content="An “On this page” list of a page's sections that highlights the one being read as the reader scrolls."
	/>
	<meta property="og:title" content="Table of contents — Sina UI" />
	<meta
		property="og:description"
		content="An “On this page” list of a page's sections that highlights the one being read as the reader scrolls."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Table of contents</h1>
<p class="lede">
	An “On this page” list for long pages such as docs and articles: a link to each section, and a
	thumb on the rail that slides to the section being read as the page scrolls.
</p>

<h2 id="installation">Installation</h2>
<Install names="toc">
	<p>Copy <code>src/lib/ui/Toc.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="This page's sections"
	description="The items are this page's own headings, so scrolling the page moves the highlight. Pass offset when a sticky header covers the top of the page."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>items</code></td><td
				><code>{'{'} id, label, level?: 2 | 3 }[]</code> (required): each heading's id and text</td
			><td></td></tr
		>
		<tr
			><td><code>label</code></td><td><code>string</code>: the title and the navigation's name</td
			><td><code>'On this page'</code></td></tr
		>
		<tr
			><td><code>offset</code></td><td
				><code>number</code>: px covered by a fixed header, so a section counts once it clears it</td
			><td><code>0</code></td></tr
		>
		<tr
			><td><code>current</code></td><td><code>string</code>, bindable: the section being read</td
			><td></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A <code>nav</code> named by its title, with the links in an ordered list.</li>
	<li>
		The section being read has <code>aria-current="location"</code>; the thumb is decoration and
		snaps instead of sliding when the reader asks for less motion.
	</li>
	<li>
		Give the headings <code>scroll-margin-top</code> equal to your header's height so a jump doesn't hide
		the heading under it.
	</li>
	<li>Renders nothing when there are no items, so a short page doesn't get an empty box.</li>
</ul>
