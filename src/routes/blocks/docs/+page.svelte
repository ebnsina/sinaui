<script lang="ts">
	import { resolve } from '$app/paths';
	import Code from '#lib/site/Code.svelte';
	import DevicePreview from '#lib/site/DevicePreview.svelte';
	import Install from '#lib/site/Install.svelte';
	import layout from './site/+layout.svelte?raw';
	import docPage from './site/[[page]]/+page.svelte?raw';
</script>

<svelte:head>
	<title>Docs — Sina UI</title>
	<meta
		name="description"
		content="A documentation site: top-bar tabs, a grouped sidebar, search, an “On this page” rail, code tabs, Markdown actions and previous and next links."
	/>
	<meta property="og:title" content="Docs — Sina UI" />
	<meta
		property="og:description"
		content="A documentation site: top-bar tabs, a grouped sidebar, search, an “On this page” rail, code tabs, Markdown actions and previous and next links."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Docs</h1>
<p class="lede">
	Everything a product's documentation needs around the words: tabs for each part of the docs, a
	sidebar of pages, search on ⌘K, a contents rail that follows the reader, code in several
	languages, and each page as Markdown for people who paste docs into an AI tool.
</p>

<h2 id="installation">Installation</h2>
<Install names="blocks/docs">
	<p>
		Copy <code>src/lib/blocks/docs/</code> with the components it uses: Docs nav, Table of contents, Command
		palette, Dialog, Breadcrumb, Code block, Tabs, Copy button, Theme toggle, Kbd, Button and Icon.
	</p>
</Install>

<h2 id="example">Example</h2>
<p>
	The docs of Warraq, a pretend manuscript catalog: four pages under two tabs. Pick a code language
	once and every sample on the page follows it. Switch to Phone to see the sidebar fold into a menu.
</p>
<DevicePreview src={resolve('/blocks/docs/site' as '/')} title="The Warraq docs" />

<h2 id="usage">Usage</h2>
<p>
	The layout goes in your docs' <code>+layout.svelte</code> and takes the nav as data; each page
	renders a <code>DocsPage</code> with its content as children. The example's own files:
</p>
<Code code={layout} label="site/+layout.svelte" />
<Code code={docPage} label="site/[[page]]/+page.svelte" />

<h2 id="props">Props</h2>
<h3 id="docs-layout">DocsLayout</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>name</code></td><td><code>string</code>: the product</td><td>required</td></tr>
		<tr
			><td><code>sections</code></td><td
				><code>{'{ label, href, groups }[]'}</code>: top-bar tabs; one shows no tabs</td
			><td>required</td></tr
		>
		<tr
			><td><code>current</code></td><td><code>string</code>: the page's path</td><td>required</td
			></tr
		>
		<tr><td><code>home</code></td><td><code>string</code></td><td><code>'/'</code></td></tr>
		<tr><td><code>logo</code></td><td><code>Snippet</code></td><td>the name</td></tr>
		<tr><td><code>action</code></td><td><code>{'{ label, href }'}</code></td><td></td></tr>
		<tr
			><td><code>search</code></td><td
				><code>(query) =&gt; Command[]</code>: your own index; pages by title without it</td
			><td></td></tr
		>
		<tr><td><code>searchEmpty</code></td><td><code>string</code></td><td>“Nothing matches…”</td></tr
		>
		<tr
			><td><code>onnavigate</code></td><td
				><code>(href) =&gt; void</code>: pass <code>goto</code></td
			><td>a full page load</td></tr
		>
		<tr><td><code>footer</code></td><td><code>Snippet</code></td><td></td></tr>
	</tbody>
</table>

<h3 id="docs-page">DocsPage</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>title</code>, <code>description</code></td><td><code>string</code></td><td
			></td></tr
		>
		<tr><td><code>crumbs</code></td><td><code>{'{ label, href? }[]'}</code></td><td></td></tr>
		<tr
			><td><code>markdown</code></td><td
				><code>string | () =&gt; Promise&lt;string&gt;</code>: shows “Copy page as Markdown”</td
			><td></td></tr
		>
		<tr
			><td><code>markdownHref</code></td><td><code>string</code>: shows “View as Markdown”</td><td
			></td></tr
		>
		<tr
			><td><code>toc</code></td><td><code>{'{ id, label, level? }[]'}</code></td><td
				><code>[]</code></td
			></tr
		>
		<tr
			><td><code>prev</code>, <code>next</code></td><td><code>{'{ label, href }'}</code></td><td
			></td></tr
		>
	</tbody>
</table>
<p>
	<code>locate(sections, current)</code> finds a page's tab, group and its previous and next pages,
	so the crumbs and pager come from the same nav as the sidebar. <code>CodeTabs</code> takes
	<code>{'samples: { label, code, lang?, filename? }[]'}</code> and a bindable <code>value</code>.
</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A skip link, a banner, one main region and named navigations for the tabs, pages and contents.
	</li>
	<li>
		The current tab and page carry <code>aria-current="page"</code>; the section being read,
		<code>aria-current="location"</code>.
	</li>
	<li>Search opens on ⌘K (Ctrl+K elsewhere) and is a full keyboard command palette.</li>
	<li>Below 56rem the sidebar moves into a sheet; below 75rem the contents rail hides.</li>
	<li>
		Everything is server-rendered: the page reads without JavaScript, and reduced motion is
		respected.
	</li>
</ul>
