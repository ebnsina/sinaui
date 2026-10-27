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
	<title>Sparkline — Sina UI</title>
	<meta
		name="description"
		content="A small trend line that fills its width, for a number in a card or a table row."
	/>
	<meta property="og:title" content="Sparkline — Sina UI" />
	<meta
		property="og:description"
		content="A small trend line that fills its width, for a number in a card or a table row."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Sparkline</h1>
<p class="lede">
	A trend at a glance: a thin line, and a faint area under it, that fills the width it's given. Put
	it under a number in a card or at the end of a table row; for a chart people read closely, use
	Chart.
</p>

<h2 id="installation">Installation</h2>
<Install names="sparkline">
	<p>Copy <code>src/lib/ui/Sparkline.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="stat"
	title="Under a number"
	description="Each reading room's week of visits. The line takes the chart color; one value or none draws a flat hairline."
	{...ex('stat')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>values</code></td><td><code>number[]</code> (required), oldest first</td><td
			></td></tr
		>
		<tr
			><td><code>label</code></td><td><code>string</code> (required): what it shows</td><td
			></td></tr
		>
		<tr><td><code>height</code></td><td><code>number</code>, in px</td><td><code>32</code></td></tr>
		<tr
			><td><code>area</code></td><td><code>boolean</code>: shade under the line</td><td
				><code>true</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		An image with your <code>label</code> as its name; say the trend in it (“rising”, “flat”), since the
		drawing itself isn't read.
	</li>
	<li>
		Put the number it belongs to in text next to it: a sparkline adds the shape, never the only
		figure.
	</li>
</ul>
