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
	<title>Account menu — Sina UI</title>
	<meta
		name="description"
		content="The signed-in person's menu for a top bar: who they are, switching organizations, your own items and signing out."
	/>
	<meta property="og:title" content="Account menu — Sina UI" />
	<meta
		property="og:description"
		content="The signed-in person's menu for a top bar: who they are, switching organizations, your own items and signing out."
	/>
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Account menu</h1>
<p class="lede">
	The avatar at the end of a top bar. It opens a menu with who's signed in, the organizations they
	can switch between, your own items and signing out, so organization switching doesn't need a
	control of its own.
</p>

<h2 id="installation">Installation</h2>
<Install names="account-menu">
	<p>
		Copy <code>src/lib/ui/AccountMenu.svelte</code> with Avatar, Icon, Dropdown and
		<code>tokens.css</code>. Needs <code>@hugeicons/core-free-icons</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="switcher"
	title="With organizations"
	description="Open it, switch between three libraries, or add a new one. Account settings is an item passed in as children."
	{...ex('switcher')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>user</code></td><td><code>{'{'} name, email?, image? }</code> (required)</td><td
			></td></tr
		>
		<tr
			><td><code>orgs</code></td><td><code>{'{'} id, name }[]</code></td><td><code>[]</code></td
			></tr
		>
		<tr
			><td><code>org</code></td><td><code>string</code>: the current organization, ticked</td><td
			></td></tr
		>
		<tr><td><code>onorg</code></td><td><code>(org) =&gt; void</code></td><td></td></tr>
		<tr
			><td><code>onneworg</code></td><td><code>() =&gt; void</code>: shows “New organization”</td
			><td></td></tr
		>
		<tr><td><code>children</code></td><td>Snippet: your own Dropdown items</td><td></td></tr>
		<tr
			><td><code>onsignout</code></td><td><code>() =&gt; void</code>: shows “Sign out”</td><td
			></td></tr
		>
		<tr
			><td><code>labels</code></td><td
				><code>{'{'} account, organizations, newOrg, signOut }</code></td
			><td>English</td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The button is named “Account: ” and the person's name, and opens a menu like Dropdown.</li>
	<li>The current organization is marked with <code>aria-current</code> as well as the tick.</li>
	<li>The name, email and section title are plain text in the menu, never focus stops.</li>
</ul>
