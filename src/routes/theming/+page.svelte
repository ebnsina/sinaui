<script lang="ts">
	import { resolve } from '$app/paths';
	const tokens: [string, string, boolean][] = [
		['--ui-bg', 'The page', true],
		['--ui-surface', 'Cards, menus, dialogs', true],
		['--ui-fg', 'Text', true],
		['--ui-muted', 'Secondary text', true],
		['--ui-faint', 'The faintest fill: toolbar groups, idle stat tabs', true],
		['--ui-subtle', 'Quiet fills: tags, tracks, the current row', true],
		['--ui-hover', 'A step stronger than subtle', true],
		['--ui-line', 'Hairlines between things', true],
		['--ui-field-line', 'Borders of fields, buttons and cards', true],
		['--ui-control-line', 'Checkbox and radio outlines', true],
		['--ui-accent', 'Brand color: primary buttons, focus, selection', true],
		['--ui-on-accent', 'Text on the accent', true],
		['--ui-danger', 'Errors and destructive actions', true],
		['--ui-on-danger', 'Text on danger', true],
		['--ui-warning', 'Warnings', true],
		['--ui-backdrop', 'Behind dialogs', true],
		['--ui-ring', 'Focus ring color (the accent)', true],
		['--ui-ring-width', 'Focus ring thickness', false],
		['--ui-ring-offset', 'Gap between ring and control', false],
		['--ui-chart-1', 'First chart series (the accent)', true],
		['--ui-chart-2 … 6', 'The other chart series, in order', false],
		['--ui-radius', 'Corners of surfaces: cards, menus, dialogs', false],
		['--ui-radius-control', 'Corners of controls: buttons, fields, tags; 999px for pills', false],
		['--ui-control-h', 'Height of fields, selects, medium buttons and tabs', false],
		['--ui-control-h-sm', 'Height of small buttons', false],
		['--ui-control-h-xs', 'Height of extra-small buttons (24px with a mouse)', false],
		['--ui-control-h-lg', 'Height of large buttons', false],
		['--ui-control-h-touch', 'Height of every control on touch screens (44px or more)', false],
		['--ui-button-font', 'Text size of medium buttons', false],
		[
			'--ui-control-font',
			'Text size inside fields (16px or more on touch: iOS zooms smaller)',
			false
		],
		['--ui-shadow-card', 'Resting cards: a 1px ring, no drop shadow', false],
		['--ui-shadow-overlay', 'Menus, popovers, dialogs', false],
		['--ui-font', 'Text', false],
		['--ui-font-size', 'Everyday text: labels, menus, lists (14px with a mouse)', false],
		['--ui-item-h', 'Height of a menu or list row (32px with a mouse)', false],
		['--ui-font-mono', 'Code and numbers', false],
		['--ui-font-heading', 'Titles of dialogs, cards, alerts; unset, they follow the text', false],
		['--ui-sidebar-bg', 'Sidebar layout: the sidebar', true],
		['--ui-sidebar-line', 'Sidebar layout: its edges (a hairline by default)', true],
		['--ui-sidebar-current-bg', 'Sidebar layout: the current page', true],
		['--ui-sidebar-current-fg', 'Sidebar layout: the current page’s text', true],
		['--ui-sidebar-w', 'Sidebar layout: its open width', false],
		['--ui-button-pad-lg', 'Button: a large button’s side padding', false],
		['--ui-sidebar-item-h', 'Sidebar layout: the height of each page row', false],
		['--ui-sidebar-font', 'Sidebar layout: the page rows’ text size', false],
		['--ui-sidebar-title-font', 'Sidebar layout: the group titles’ text size', false],
		[
			'--ui-sidebar-title-case',
			'Sidebar layout: the group titles’ letter case (none or uppercase)',
			false
		],
		['--ui-sidebar-title-tracking', 'Sidebar layout: the group titles’ letter spacing', false],
		['--ui-sheet-width', 'Dialog: a side sheet’s width', false],
		['--ui-sheet-inset', 'Dialog: room a side sheet leaves beside it on narrow screens', false],
		['--ui-ease-out', 'Things arriving', false],
		['--ui-ease-in-out', 'Things moving on screen', false],
		['--ui-ease-drawer', 'Sheets and drawers', false],
		['--ui-dur-press', 'Press feedback', false],
		['--ui-dur', 'Most transitions', false],
		['--ui-dur-overlay', 'Overlays opening', false]
	];
</script>

<svelte:head>
	<title>Theming — Sina UI</title>
	<meta
		name="description"
		content="Change Sina UI's colors, corners, type and motion with a few CSS variables."
	/>
	<meta property="og:title" content="Theming — Sina UI" />
	<meta
		property="og:description"
		content="Change Sina UI's colors, corners, type and motion with a few CSS variables."
	/>
</svelte:head>

<p class="eyebrow">Getting started</p>
<h1>Theming</h1>
<p class="lede">
	Every component takes its colors, corners, type and motion from a few CSS variables in
	<code>tokens.css</code>. Change them once and everything follows.
</p>
<p>
	<code>npx sinaui init</code> adds the tokens to your project; see
	<a href={resolve('/docs')}>Installation</a>.
</p>

<h2 id="corners">Corners</h2>
<p>
	Surfaces and controls round separately. <code>--ui-radius</code> shapes cards, menus and dialogs;
	<code>--ui-radius-control</code> shapes buttons, fields and tags. Set the control radius to
	<code>999px</code> for pill-shaped controls while cards keep their corners.
</p>

<h2 id="size">Size</h2>
<p>
	Fields, selects, medium buttons and tabs share one height, <code>--ui-control-h</code>, and one
	text size, <code>--ui-control-font</code>, so a form lines up at any size. For a compact
	interface, set them inside <code>@media (pointer: fine)</code>: touch screens keep 44px targets,
	and iOS Safari zooms into any field with text under 16px. Small and large buttons follow
	<code>--ui-control-h-sm</code> and <code>--ui-control-h-lg</code>, button text
	<code>--ui-button-font</code>, and on touch screens every control is
	<code>--ui-control-h-touch</code> tall.
</p>

<h2 id="dark-mode">Dark mode</h2>
<p>
	Every color is a <code>light-dark()</code> pair, so pages follow the reader's system setting. To
	let people choose, set <code>data-theme="light"</code> or <code>"dark"</code> on
	<code>&lt;html&gt;</code>.
</p>
<p>
	When you change a color, give both halves: <code>light-dark(#4338ca, #a5b4fc)</code>. Check that
	text on it reads at 4.5:1 in each.
</p>

<h2 id="type">Type</h2>
<p>
	Components use <code>--ui-font</code> for text and <code>--ui-font-mono</code> for code. Load your fonts
	as usual, then point these at them.
</p>
<p>
	Text inside components follows your page's font. <code>tokens.css</code> sets the page to
	<code>--ui-font</code> only when your app doesn't set its own. If it does (Tailwind sets one), the
	components take your app's font. To use <code>--ui-font</code> everywhere, add
	<code>html &#123; font-family: var(--ui-font); &#125;</code> after your own CSS.
</p>
<p>
	For a display face on titles (dialogs, drawers, cards, alerts, empty states), set
	<code>--ui-font-heading</code>. Left unset, titles follow the text around them.
</p>

<h2 id="tailwind">With Tailwind</h2>
<p>
	Components work alongside Tailwind's reset with nothing to configure: they set their own borders,
	spacing and list styles. Their CSS is scoped, so Tailwind classes in your markup don't change
	them.
</p>

<h2 id="tokens">All tokens</h2>
<table class="tokens">
	<thead><tr><th>Token</th><th>Used for</th></tr></thead>
	<tbody>
		{#each tokens as [name, use, color] (name)}
			<tr>
				<td>
					<span class="token">
						{#if color}<span class="swatch" style:background="var({name})"></span>{/if}
						<code>{name}</code>
					</span>
				</td>
				<td>{use}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.token .swatch {
		inline-size: 1rem;
		block-size: 1rem;
		border-radius: 0.25rem;
		box-shadow: inset 0 0 0 1px var(--ui-line);
	}
</style>
