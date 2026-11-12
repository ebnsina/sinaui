<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Example from '#lib/site/Example.svelte';
	import { examples } from '#lib/site/examples.js';
	import Code from '#lib/site/Code.svelte';

	const usage = `<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import Studio from '$lib/sinaui/blocks/studio/Studio.svelte';

  let { data, children } = $props();
</${'script'}>

<Studio name="Admin" home="/admin" {groups} path={page.url.pathname} user={data.user}>
  {@render children()}
</Studio>`;

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
	<title>Studio — Sina UI</title>
	<meta
		name="description"
		content="The frame of a signed-in app: searchable sidebar, breadcrumbs, account menu, a phone tab bar, and the page pieces that go inside."
	/>
	<meta property="og:title" content="Studio — Sina UI" />
	<meta
		property="og:description"
		content="The frame of a signed-in app: searchable sidebar, breadcrumbs, account menu, a phone tab bar, and the page pieces that go inside."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Studio</h1>
<p class="lede">
	The frame for any signed-in app: an admin, a portal, a dashboard. A sidebar you can search and
	collapse, breadcrumbs, the account menu with the theme switch, and on phones a bottom tab bar like
	a mobile app's. It comes with the pieces every page inside needs: a page header, headline numbers,
	a row opener and a detail sheet.
</p>

<h2 id="installation">Installation</h2>
<Install names="blocks/studio">
	<p>
		Copy <code>src/lib/blocks/studio/</code> with the components it uses: Sidebar layout, Account menu,
		Search field, Dialog, Rolling number and Icon.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="library"
	title="A library's members page"
	description="Search the menu, collapse the sidebar, open the account menu. Press a name to open its sheet. Narrow the window to a phone's width: the sidebar gives way to a tab bar, with More opening the full menu."
	{...ex('library')}
/>

<h2 id="usage">Using it in SvelteKit</h2>
<p>
	Put <code>Studio</code> in the layout of the signed-in area and give it the current address. It fills
	the window, so the page scrolls inside it.
</p>
<Code code={usage} label="Studio in a SvelteKit layout" />

<h2 id="props">Props</h2>
<h3 id="studio">Studio</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>name</code></td><td
				><code>string</code>: names the navigation; the first breadcrumb</td
			><td>required</td></tr
		>
		<tr
			><td><code>home</code></td><td><code>string</code>: the app's first page</td><td>required</td
			></tr
		>
		<tr
			><td><code>groups</code></td><td><code>SidebarGroup[]</code>, as in Sidebar layout</td><td
				>required</td
			></tr
		>
		<tr
			><td><code>path</code></td><td
				><code>string</code>: the address being shown; the deepest item it starts with is current</td
			><td>required</td></tr
		>
		<tr
			><td><code>user</code></td><td><code>{'{ name, email?, image? }'}</code></td><td>required</td
			></tr
		>
		<tr
			><td><code>onsignout</code></td><td
				><code>() =&gt; void</code>: shows "Sign out" when given</td
			><td>—</td></tr
		>
		<tr><td><code>onselect</code></td><td><code>(item) =&gt; void</code></td><td>—</td></tr>
		<tr
			><td><code>brand</code></td><td
				>snippet <code>(collapsed)</code>: your logo, in place of the letter mark and name</td
			><td>—</td></tr
		>
		<tr
			><td><code>tools</code></td><td>snippet: in the top bar before the account menu</td><td>—</td
			></tr
		>
		<tr><td><code>menu</code></td><td>snippet: your items in the account menu</td><td>—</td></tr>
		<tr
			><td><code>tabs</code></td><td
				><code>SidebarItem[] | false</code>: the phone tab bar's pages, up to four</td
			><td>the first group</td></tr
		>
		<tr
			><td><code>search</code></td><td><code>boolean</code>: the field that narrows the menu</td><td
				><code>true</code></td
			></tr
		>
		<tr><td><code>inset</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
		<tr><td><code>height</code></td><td><code>string</code></td><td><code>'100dvh'</code></td></tr>
		<tr
			><td><code>labels</code></td><td
				><code>{'{ search, noMatch, more, account, signOut, darkTheme, lightTheme }'}</code></td
			><td>English</td></tr
		>
	</tbody>
</table>

<h3 id="page-header">PageHeader</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>title</code></td><td><code>string</code></td><td>required</td></tr>
		<tr><td><code>description</code></td><td><code>string</code></td><td>—</td></tr>
		<tr
			><td><code>actions</code></td><td
				>snippet: page controls on the right, the main action last</td
			><td>—</td></tr
		>
	</tbody>
</table>

<h3 id="stat">Stat</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code></td><td>required</td></tr>
		<tr
			><td><code>value</code></td><td
				><code>string</code>, already formatted; its digits count up when it scrolls into view</td
			><td>required</td></tr
		>
		<tr><td><code>hint</code></td><td><code>string</code></td><td>—</td></tr>
		<tr><td><code>icon</code></td><td>a Hugeicons icon</td><td>—</td></tr>
		<tr
			><td><code>locales</code></td><td
				><code>Intl.LocalesArgument</code>, when the digits aren't 0-9</td
			><td>—</td></tr
		>
	</tbody>
</table>

<h3 id="row-link">RowLink</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code></td><td>required</td></tr>
		<tr
			><td><code>onclick</code></td><td><code>() =&gt; void</code>: open the row's detail sheet</td
			><td>required</td></tr
		>
	</tbody>
</table>

<h3 id="detail-sheet">DetailSheet</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>open</code></td><td><code>boolean</code> (bindable)</td><td>required</td></tr>
		<tr><td><code>title</code></td><td><code>string</code></td><td>required</td></tr>
		<tr><td><code>description</code></td><td><code>string</code></td><td>—</td></tr>
		<tr
			><td><code>fields</code></td><td><code>{'{ label, value, icon?, mono? }[]'}</code></td><td
				>required</td
			></tr
		>
		<tr
			><td><code>lead</code></td><td>snippet: above the fields (status badges, an error)</td><td
				>—</td
			></tr
		>
		<tr
			><td><code>children</code></td><td>snippet: below the fields (a form, a list)</td><td>—</td
			></tr
		>
		<tr
			><td><code>footer</code></td><td>snippet: actions, Cancel first and the main one last</td><td
				>—</td
			></tr
		>
		<tr
			><td><code>closeLabel</code></td><td><code>string</code></td><td><code>'Close'</code></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The sidebar, the breadcrumbs and the phone tab bar are separate named navigation landmarks.
	</li>
	<li>The current page is marked <code>aria-current="page"</code> in each of them.</li>
	<li>A search with no match says so in a status message, so it is announced.</li>
	<li>Stat gives screen readers the real number at once, not the zeros it counts up from.</li>
	<li>RowLink is a real button: every row's sheet can be opened from the keyboard.</li>
</ul>
