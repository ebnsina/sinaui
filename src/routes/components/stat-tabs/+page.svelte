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
	<title>Stat tabs — Sina UI</title>
	<meta
		name="description"
		content="A row of headline numbers above a chart; choosing one switches what the chart shows."
	/>
	<meta property="og:title" content="Stat tabs — Sina UI" />
	<meta
		property="og:description"
		content="A row of headline numbers above a chart; choosing one switches what the chart shows."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Stat tabs</h1>
<p class="lede">
	Headline numbers in a row above a chart. Each one is a choice: pick a number and the chart below
	shows it.
</p>

<h2 id="installation">Installation</h2>
<Install names="stat-tabs">
	<p>Copy <code>src/lib/ui/StatTabs.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="chart"
	title="Above a chart"
	description="Inside a flush Card: the chosen number sits on the panel with an underline, the others on a faint fill. On narrow screens they go two to a row."
	{...ex('chart')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>label</code></td><td><code>string</code> (required): names the group</td><td
			></td></tr
		>
		<tr
			><td><code>items</code></td><td
				><code>{'{'} value, label, display, change?, trend? }[]</code>: <code>display</code> is the
				number as shown, formatted with <code>Intl</code>; <code>change</code> is a short line under
				it ("+12% on last week") and <code>trend</code> (<code>up</code>, <code>down</code>,
				<code>flat</code>) draws its arrow, without color</td
			><td></td></tr
		>
		<tr><td><code>value</code></td><td><code>string</code>, bindable</td><td>the first item</td></tr
		>
		<tr><td><code>name</code></td><td><code>string</code></td><td>a unique id</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Native radios in a named radio group: one Tab stop, and each one is read as its label and
		number, such as “Loans 3,242”, then its change when there is one; the arrow is decoration, so
		word the change to read on its own.
	</li>
	<li>Correct before hydration: the chosen number is marked in the server HTML.</li>
	<li>Give the chart a title that names the chosen metric, so the change is announced with it.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>Tab</kbd></td><td>Moves into the row at the chosen number.</td></tr>
		<tr><td><kbd>←</kbd> / <kbd>→</kbd></td><td>Chooses the previous / next number.</td></tr>
	</tbody>
</table>
