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
	<title>Docs navigation — Sina UI</title>
	<meta
		name="description"
		content="Grouped page links for a documentation site, with small uppercase group labels and the current page marked."
	/>
	<meta property="og:title" content="Docs navigation — Sina UI" />
	<meta
		property="og:description"
		content="Grouped page links for a documentation site, with small uppercase group labels and the current page marked."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Docs navigation</h1>
<p class="lede">
	The page list of a documentation site or guide: links in groups under small uppercase labels, the
	current page filled in, long titles wrapping instead of being cut. It scrolls with the page, so
	put it in a sticky column on wide screens and in a Dialog sheet on phones. For an app with a
	collapsible rail, use Sidebar layout.
</p>

<h2 id="installation">Installation</h2>
<Install names="docs-nav">
	<p>
		Copy <code>src/lib/ui/DocsNav.svelte</code>, <code>glide.ts</code>, <code>motion.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Grouped pages"
	description="This page's sections in two groups. Choosing one marks it current; a badge flags something new."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>label</code></td><td><code>string</code> (required): names the navigation</td><td
			></td></tr
		>
		<tr
			><td><code>groups</code></td><td
				><code>{'{'} title?, items: {'{'} label, href, badge? }[] }[]</code> (required)</td
			><td></td></tr
		>
		<tr
			><td><code>current</code></td><td><code>string</code>: href of the page being shown</td><td
			></td></tr
		>
		<tr
			><td><code>onselect</code></td><td
				><code>(item) =&gt; void</code>: after a page is chosen, e.g. to close a sheet</td
			><td></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A <code>nav</code> named by <code>label</code>; each group's list is named by its label.</li>
	<li>The current page has <code>aria-current="page"</code> and a fill, not color alone.</li>
	<li>Rows are 44px tall on touch screens.</li>
</ul>
