<script lang="ts">
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { barY, defineChart } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import Avatar from '#lib/ui/Avatar.svelte';
	import Badge from '#lib/ui/Badge.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Calendar from '#lib/ui/Calendar.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Chart from '#lib/ui/Chart.svelte';
	import Code from '#lib/site/Code.svelte';
	import Input from '#lib/ui/Input.svelte';
	import { reduced } from '#lib/ui/motion.js';
	import Segmented from '#lib/ui/Segmented.svelte';
	import Select from '#lib/ui/Select.svelte';
	import Slider from '#lib/ui/Slider.svelte';
	import Switch from '#lib/ui/Switch.svelte';

	// Accents in light/dark pairs, each with a text color that reads on it at 4.5:1 or better.
	const accents = {
		mono: {
			label: 'Monochrome',
			accent: 'light-dark(#0f172a, #ededed)',
			on: 'light-dark(#ffffff, #0a0a0a)'
		},
		red: {
			label: 'Red',
			accent: 'light-dark(#dc2626, #fca5a5)',
			on: 'light-dark(#ffffff, #2a0707)'
		},
		orange: {
			label: 'Orange',
			accent: 'light-dark(#c2410c, #fb923c)',
			on: 'light-dark(#ffffff, #2a1205)'
		},
		amber: {
			label: 'Amber',
			accent: 'light-dark(#b45309, #fbbf24)',
			on: 'light-dark(#ffffff, #2a1a03)'
		},
		green: {
			label: 'Green',
			accent: 'light-dark(#15803d, #4ade80)',
			on: 'light-dark(#ffffff, #052e16)'
		},
		cyan: {
			label: 'Cyan',
			accent: 'light-dark(#0e7490, #22d3ee)',
			on: 'light-dark(#ffffff, #062a33)'
		},
		blue: {
			label: 'Blue',
			accent: 'light-dark(#2563eb, #60a5fa)',
			on: 'light-dark(#ffffff, #0b1a33)'
		},
		violet: {
			label: 'Violet',
			accent: 'light-dark(#7c3aed, #a78bfa)',
			on: 'light-dark(#ffffff, #1e1036)'
		},
		pink: {
			label: 'Pink',
			accent: 'light-dark(#db2777, #f472b6)',
			on: 'light-dark(#ffffff, #2a0a1c)'
		}
	};

	// Picking a color drops paint on the preview: a splash of it spreads from where you picked, then fades.
	let stage: HTMLDivElement;
	let splash: HTMLSpanElement;
	function paint(e: Event) {
		if (reduced()) return;
		const from = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const box = stage.getBoundingClientRect();
		const x = from.left + from.width / 2 - box.left;
		const y = from.top + from.height / 2 - box.top;
		const r = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y));
		splash.animate(
			[
				{ clipPath: `circle(0 at ${x}px ${y}px)`, opacity: 0.35 },
				{ clipPath: `circle(${r}px at ${x}px ${y}px)`, opacity: 0.18, offset: 0.6 },
				{ clipPath: `circle(${r}px at ${x}px ${y}px)`, opacity: 0 }
			],
			{ duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
		);
	}

	let minutes = $state(45);
	const loansByWeek = [
		{ week: 'W1', loans: 212 },
		{ week: 'W2', loans: 286 },
		{ week: 'W3', loans: 248 },
		{ week: 'W4', loans: 331 },
		{ week: 'W5', loans: 297 },
		{ week: 'W6', loans: 374 }
	];
	const loansChart = defineChart({
		marks: [barY(loansByWeek, { x: 'week', y: 'loans', radius: 4 })],
		scales: {
			x: { scale: () => scaleBand<string>().padding(0.35), axis: false },
			y: { scale: scaleLinear, nice: true, axis: false }
		}
	});
	const now = today(getLocalTimeZone());
	let stay = $state({ start: now.add({ days: 3 }), end: now.add({ days: 9 }) });
	const team = [
		{ name: 'Maryam al-Ijliya', email: 'maryam@hikma.org', role: 'owner' },
		{ name: 'Ibn al-Haytham', email: 'alhazen@hikma.org', role: 'editor' },
		{ name: 'Lubna of Córdoba', email: 'lubna@hikma.org', role: 'viewer' }
	];
	let accent = $state<keyof typeof accents>('mono');
	// Corners in named steps; the last makes controls fully round (surfaces stop at 16px).
	const corners = [
		{ name: 'Sharp', px: 0 },
		{ name: 'Subtle', px: 4 },
		{ name: 'Soft', px: 8 },
		{ name: 'Round', px: 12 },
		{ name: 'Rounder', px: 16 },
		{ name: 'Pill', px: 16, pill: true }
	];
	let step = $state(2);
	let mode = $state<'light' | 'dark'>('light');
	let notify = $state(true);
	let loan = $state('2w');

	const chosen = $derived(accents[accent]);
	const corner = $derived(corners[step]);
	const surface = $derived(`${corner.px / 16}rem`);
	const control = $derived(corner.pill ? '999px' : surface);
	const css = $derived(`:root {
	--ui-accent: ${chosen.accent};
	--ui-on-accent: ${chosen.on};
	--ui-radius: ${surface};
	--ui-radius-control: ${control};
}`);

	const tokens: [string, string, boolean][] = [
		['--ui-bg', 'The page', true],
		['--ui-surface', 'Cards, menus, dialogs', true],
		['--ui-fg', 'Text', true],
		['--ui-muted', 'Secondary text', true],
		['--ui-subtle', 'Quiet fills: tags, tracks, hover rows', true],
		['--ui-hover', 'A step stronger than subtle', true],
		['--ui-line', 'Hairlines between things', true],
		['--ui-field-line', 'Text field borders', true],
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
		['--ui-control-h-lg', 'Height of large buttons', false],
		['--ui-control-h-touch', 'Height of every control on touch screens (44px or more)', false],
		['--ui-button-font', 'Text size of medium buttons', false],
		[
			'--ui-control-font',
			'Text size inside fields (16px or more on touch: iOS zooms smaller)',
			false
		],
		['--ui-shadow-card', 'Resting cards', false],
		['--ui-shadow-overlay', 'Menus, popovers, dialogs', false],
		['--ui-font', 'Text', false],
		['--ui-font-size', 'Everyday text: labels, menus, lists (14px with a mouse)', false],
		['--ui-item-h', 'Height of a menu or list row (32px with a mouse)', false],
		['--ui-font-mono', 'Code and numbers', false],
		['--ui-font-heading', 'Titles of dialogs, cards, alerts; unset, they follow the text', false],
		['--ui-sidebar-bg', 'Sidebar layout: the sidebar', true],
		['--ui-sidebar-line', 'Sidebar layout: its edges (transparent by default)', true],
		['--ui-sidebar-current-bg', 'Sidebar layout: the current page', true],
		['--ui-sidebar-current-fg', 'Sidebar layout: the current page’s text', true],
		['--ui-sidebar-w', 'Sidebar layout: its open width', false],
		['--ui-sidebar-item-h', 'Sidebar layout: the height of each page row', false],
		['--ui-sidebar-font', 'Sidebar layout: the page rows’ text size', false],
		['--ui-sidebar-title-font', 'Sidebar layout: the group titles’ text size', false],
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

<h2 id="try">Try it</h2>
<div class="lab-wrap">
	<div class="lab">
		<div class="controls">
			<fieldset class="accents">
				<legend>Accent</legend>
				<div class="swatches">
					{#each Object.entries(accents) as [key, a] (key)}
						<label class="swatch" style:--c={a.accent} title={a.label}>
							<input type="radio" name="accent" value={key} bind:group={accent} onclick={paint} />
							<span class="sr-only">{a.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>
			<Slider
				label="Corners"
				min={0}
				max={corners.length - 1}
				bind:value={step}
				format={(v) => corners[v].name}
			/>
			<Segmented
				label="Preview in"
				options={[
					{ value: 'light', label: 'Light' },
					{ value: 'dark', label: 'Dark' }
				]}
				bind:value={() => mode, (v) => (mode = v as typeof mode)}
			/>
		</div>

		<!-- The preview takes the theme through the same variables your app would set. -->
		<div
			bind:this={stage}
			class="stage"
			style:color-scheme={mode}
			style:--ui-accent={chosen.accent}
			style:--ui-on-accent={chosen.on}
			style:--ui-ring={chosen.accent}
			style:--ui-chart-1={chosen.accent}
			style:--ui-radius={surface}
			style:--ui-radius-control={control}
		>
			<span class="splash" aria-hidden="true" bind:this={splash} style:background={chosen.accent}
			></span>
			<!-- Real components in real cards: the theme shows on charts, a calendar, menus and a form. -->
			<div class="board">
				<div class="col">
					<Card title="Loans this month" description="Up from 1,057 in September">
						{#snippet aside()}<Badge tone="accent">+18%</Badge>{/snippet}
						<p class="big">1,248</p>
						<Chart title="Loans per week" definition={loansChart} height={110} />
					</Card>
					<Card title="Team" description="Who can lend from this room">
						<ul class="team">
							{#each team as m (m.email)}
								<li>
									<Avatar name={m.name} size="sm" />
									<span class="who"><strong>{m.name}</strong><span>{m.email}</span></span>
									<Select label="Role for {m.name}" hideLabel value={m.role}>
										<option value="owner">Owner</option>
										<option value="editor">Editor</option>
										<option value="viewer">Viewer</option>
									</Select>
								</li>
							{/each}
						</ul>
					</Card>
					<Card title="Borrow a copy">
						<Input label="Reader's name" placeholder="Ibn Sina" />
						<Segmented
							label="For"
							fill
							options={[
								{ value: '1w', label: '1 week' },
								{ value: '2w', label: '2 weeks' },
								{ value: '1m', label: 'A month' }
							]}
							bind:value={loan}
						/>
						{#snippet footer()}
							<Button variant="ghost" size="sm">Details</Button>
							<Button size="sm">Borrow</Button>
						{/snippet}
					</Card>
				</div>
				<div class="col">
					<Card title="Reading room" description="Book a desk for your stay">
						<Calendar
							label="Your stay"
							mode="range"
							range={stay}
							onrangechange={(r) => (stay = r)}
							fill
						/>
					</Card>
					<Card title="Daily reading goal">
						<p class="big">{minutes} <span>min a day</span></p>
						<Slider label="Minutes" min={10} max={120} step={5} bind:value={minutes} />
						{#snippet footer()}
							<Switch bind:checked={notify}>Remind me</Switch>
							<Button size="sm">Set goal</Button>
						{/snippet}
					</Card>
				</div>
			</div>
		</div>
	</div>
</div>
<p>Add your choice after <code>tokens.css</code>:</p>
<Code code={css} lang="css" label="Theme overrides" />

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
	/* Controls beside the preview; stacked when there isn't room. */
	.lab-wrap {
		container: lab / inline-size;
		margin-block: 1rem;
	}
	.lab {
		display: grid;
		grid-template-columns: minmax(13rem, 16rem) minmax(0, 1fr);
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: 1.5rem;
		background: var(--ui-subtle);
	}
	@container lab (width < 40rem) {
		.lab {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.controls {
		display: grid;
		align-content: start;
		gap: 1.5rem;
		padding: 1.25rem 1rem;
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-block-end: 0.5rem;
		padding: 0;
		font: 500 0.9375rem/1.5 var(--ui-font);
	}
	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.625rem;
	}
	/* Paint drops: each accent is a drop of color; the chosen one shows a white center and lands with
	   a little squash. */
	.swatch {
		position: relative;
		display: block;
		inline-size: 1.75rem;
		block-size: 1.75rem;
		border-radius: 0 50% 50% 50%;
		background:
			radial-gradient(circle at 35% 35%, rgb(255 255 255 / 0.35), transparent 45%), var(--c);
		box-shadow:
			inset 0 0 0 1px rgb(0 0 0 / 0.08),
			0 2px 4px -1px color-mix(in srgb, var(--c) 50%, transparent);
		rotate: 45deg;
		cursor: pointer;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) {
		.swatch:hover {
			scale: 1.1;
		}
	}
	.swatch:has(input:checked)::after {
		content: '';
		position: absolute;
		inset: 0;
		margin: auto;
		inline-size: 0.5rem;
		block-size: 0.5rem;
		border-radius: 50%;
		background: #fff;
	}
	.swatch:has(input:checked) {
		animation: plop 360ms var(--ui-ease-out);
	}
	@keyframes plop {
		30% {
			scale: 1.2 0.8;
		}
		60% {
			scale: 0.92 1.08;
		}
	}
	.swatch input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}
	.swatch:has(input:focus-visible) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 3px;
	}
	@media (prefers-reduced-motion: reduce) {
		.swatch:has(input:checked) {
			animation: none;
		}
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	/* The preview's own page, in the chosen scheme; concentric with the lab (1.5rem less its 0.5rem inset). */
	.stage {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		place-items: center;
		/* Narrower sides on phones so the card's three buttons stay on one row. */
		position: relative;
		overflow: hidden;
		container-type: inline-size;
		padding: 1.5rem clamp(0.75rem, 3vw, 1.25rem);
		border-radius: 1rem;
		/* The tint over a solid page: alone, dark mode's translucent tint showed the light page through. */
		background: linear-gradient(var(--ui-subtle), var(--ui-subtle)), var(--ui-bg);
		color: var(--ui-fg);
		transition: background-color var(--ui-dur-overlay) ease;
	}
	.splash {
		position: absolute;
		inset: 0;
		z-index: 2;
		opacity: 0;
		pointer-events: none;
	}
	/* Two columns of cards, like a real screen; one column when narrow. */
	.board {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		inline-size: 100%;
		align-items: start;
	}
	.col {
		display: grid;
		gap: 0.75rem;
	}
	.big {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
	}
	.big span {
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-weight: 400;
		letter-spacing: 0;
	}
	.team {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.team li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) 6.5rem;
		align-items: center;
		gap: 0.625rem;
	}
	.who {
		display: grid;
		min-inline-size: 0;
		font-size: 0.8125rem;
	}
	.who strong {
		overflow: hidden;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.who span {
		overflow: hidden;
		color: var(--ui-muted);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	@container (width < 40rem) {
		.board {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	/* Scoped to the table: a bare .swatch here also shrank the accent dots above to 1rem squares. */
	.token .swatch {
		inline-size: 1rem;
		block-size: 1rem;
		border-radius: 0.25rem;
		box-shadow: inset 0 0 0 1px var(--ui-line);
	}
</style>
