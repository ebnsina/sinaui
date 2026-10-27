<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Code from '#lib/site/Code.svelte';
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

	const head = `<script>
  try {
    const t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch {}
<${'/'}script>`;
</script>

<svelte:head>
	<title>Theme toggle — Sina UI</title>
	<meta
		name="description"
		content="Switches between light and dark, remembers the choice, and spreads the new theme in a circle from the button."
	/>
	<meta property="og:title" content="Theme toggle — Sina UI" />
	<meta
		property="og:description"
		content="Switches between light and dark, remembers the choice, and spreads the new theme in a circle from the button."
	/>
</svelte:head>

<p class="eyebrow">Buttons</p>
<h1>Theme toggle</h1>
<p class="lede">
	Switches between light and dark, remembers the choice, and spreads the new theme in a circle from
	the button. Until someone chooses, the page follows their system setting.
</p>

<h2 id="installation">Installation</h2>
<Install names="theme-toggle">
	<p>
		Copy <code>src/lib/ui/ThemeToggle.svelte</code>, with <code>theme.ts</code>,
		<code>Button.svelte</code>, <code>Icon.svelte</code>, <code>announce.ts</code> and
		<code>tokens.css</code>. It needs
		<code>@hugeicons/core-free-icons</code>.
	</p>
</Install>

<h2 id="no-flash">Avoid a flash of the wrong theme</h2>
<p>
	The saved choice has to be applied before the page first paints. Put this in the
	<code>&lt;head&gt;</code> of <code>src/app.html</code>, above <code>%sveltekit.head%</code>:
</p>
<Code code={head} label="Theme script for app.html" />

<h2 id="examples">Examples</h2>
<Example id="basic" title="Basic" {...ex('basic')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>label</code></td><td><code>string</code>: the accessible name</td><td
				>“Dark theme”</td
			></tr
		>
		<tr
			><td><code>size</code></td><td><code>'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td
			></tr
		>
	</tbody>
</table>
<p>
	To switch the theme from somewhere else, such as a menu, call
	<code>setTheme(dark)</code> from <code>theme.ts</code>. Every toggle on the page follows.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td>Switches the theme</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A toggle button: screen readers hear its name, “Dark theme”, and whether it is pressed (dark
		on).
	</li>
	<li>With reduced motion, the theme changes at once, without the circle.</li>
</ul>
