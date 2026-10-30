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
	<title>World map — Sina UI</title>
	<meta
		name="description"
		content="A map of the world shaded by a value per country, with tooltips, zoom, keyboard use and live pings."
	/>
	<meta property="og:title" content="World map — Sina UI" />
	<meta
		property="og:description"
		content="A map of the world shaded by a value per country, with tooltips, zoom, keyboard use and live pings."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>World map</h1>
<p class="lede">
	Where your numbers come from: each country shaded by its value in five steps of ink, with a
	tooltip, a click to pick a country, pinch and drag to zoom, and soft pulsing dots for what's
	happening now.
</p>

<h2 id="installation">Installation</h2>
<Install names="world-map">
	<p>
		Copy <code>src/lib/ui/WorldMap.svelte</code>, <code>world-map-shapes.ts</code>, Button, Icon and
		<code>tokens.css</code>. Needs <code>@hugeicons/core-free-icons</code>.
	</p>
</Install>
<p>
	The country outlines are Natural Earth's (public domain), projected ahead of time into plain SVG
	paths: about 40 KB gzipped, loaded the first time a map is on screen, so pages without one don't
	pay for them. Countries too small to draw at this scale, such as Singapore and Bahrain, show as a
	dot when they have data.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="visitors"
	title="Pick a country"
	description="Hover or focus a country for its name, value and share. Clicking one calls onselect; pass the code back as selected to outline it."
	{...ex('visitors')}
/>
<Example
	id="live"
	title="Happening now"
	description="Pings pulse softly over the countries where something is happening now, and new ones pop in. Reduced motion keeps them as still dots."
	{...ex('live')}
/>
<Example
	id="rate"
	title="A rate"
	description="For a rate or a score, format the value your way and turn share off."
	{...ex('rate')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>data</code></td><td
				><code>{'{ code, value, label? }[]'}</code> (required); <code>code</code> is ISO 3166-1 alpha-2,
				and anything else (an "Other" row) is left out</td
			><td></td></tr
		>
		<tr
			><td><code>title</code></td><td><code>string</code> (required): read as the map's name</td><td
			></td></tr
		>
		<tr><td><code>description</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>valueLabel</code></td><td
				><code>string</code>: the value column in the table screen readers get</td
			><td><code>'Value'</code></td></tr
		>
		<tr
			><td><code>format</code></td><td><code>(value: number) =&gt; string</code></td><td
				>whole numbers, <code>en-US</code></td
			></tr
		>
		<tr
			><td><code>share</code></td><td><code>boolean</code>: each country's share of the total</td
			><td><code>true</code></td></tr
		>
		<tr><td><code>onselect</code></td><td><code>(code: string) =&gt; void</code></td><td></td></tr>
		<tr
			><td><code>selected</code></td><td><code>string | null</code>: outlined</td><td
				><code>null</code></td
			></tr
		>
		<tr
			><td><code>pings</code></td><td
				><code>{'{ code, value? }[]'}</code>: pulsing dots, sized by value</td
			><td><code>[]</code></td></tr
		>
		<tr
			><td><code>empty</code></td><td><code>string</code>: shown when there's no data</td><td
				><code>'Nothing to show yet.'</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="interaction">Interaction</h2>
<ul>
	<li>
		Mouse: hover for a tooltip, click to select, double-click to zoom in (Shift to zoom out), drag
		to pan once zoomed, and Ctrl or ⌘ with the wheel (or a trackpad pinch) to zoom.
	</li>
	<li>
		Touch: tap to select, pinch to zoom, and drag to pan once zoomed; until then a finger scrolls
		the page as usual.
	</li>
	<li>The buttons in the corner zoom in and out, and show the whole map again.</li>
</ul>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Countries with data are one tab stop: arrow keys move between them from the largest value down,
		Home and End jump to either end, Enter or Space selects, plus and minus zoom, and 0 shows the
		whole map. Focus shows the tooltip, and a country off screen slides into view.
	</li>
	<li>
		Each country is named with its value and share, and a visually hidden table lists them all for
		screen readers.
	</li>
	<li>
		Shading is never the only cue: the tooltip and the table carry every number. Reduced motion
		turns off the fill-in, the pulses and the zoom glide.
	</li>
</ul>
