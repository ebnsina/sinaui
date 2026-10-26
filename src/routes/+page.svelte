<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import { link, root } from '#lib/site/root.js';
	import { counts, type PageId } from '#lib/site/nav.js';
	import Badge from '#lib/ui/Badge.svelte';
	import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import CopyButton from '#lib/ui/CopyButton.svelte';
	import Input from '#lib/ui/Input.svelte';
	import SegmentedControl from '#lib/ui/Segmented.svelte';
	import Switch from '#lib/ui/Switch.svelte';
	import Area from './components/chart/examples/area.svelte';
	import Picker from './components/color-picker/examples/pigments.svelte';
	import DatePicker from './components/date-picker/examples/basic.svelte';
	import Otp from './components/otp-input/examples/verify.svelte';
	import Counter from './components/rolling-number/examples/counter.svelte';
	import Segmented from './components/segmented/examples/basic.svelte';
	import Slider from './components/slider/examples/basic.svelte';
	import Toasts from './components/toast/examples/success.svelte';
	import Island from './widgets/dynamic-island/examples/activities.svelte';
	import Orb from './widgets/orb/examples/voice.svelte';

	// Live components, not screenshots: every tile works.
	const tiles: { title: string; href: PageId; demo: Component; wide?: boolean }[] = [
		{ title: 'Dynamic island', href: '/widgets/dynamic-island', demo: Island, wide: true },
		{ title: 'Rolling number', href: '/components/rolling-number', demo: Counter },
		{ title: 'Fluid orb', href: '/widgets/orb', demo: Orb },
		{ title: 'OTP input', href: '/components/otp-input', demo: Otp },
		{ title: 'Chart', href: '/components/chart', demo: Area, wide: true },
		{ title: 'Date picker', href: '/components/date-picker', demo: DatePicker },
		{ title: 'Toast', href: '/components/toast', demo: Toasts },
		{ title: 'Segmented control', href: '/components/segmented', demo: Segmented },
		{ title: 'Color picker', href: '/components/color-picker', demo: Picker },
		{ title: 'Slider', href: '/components/slider', demo: Slider }
	];

	const install = 'npx sinaui add button';
	const stats = [
		{ n: counts.components, label: 'components' },
		{ n: counts.blocks, label: 'blocks' },
		{ n: counts.widgets, label: 'widgets' }
	];
	// The hero's card is live: these drive it.
	let room = $state('Bayt al-Ḥikma');
	let hours = $state('day');
	let alerts = $state(true);

	const description =
		'Copy-paste Svelte 5 components: WAI-ARIA patterns, keyboard support, right-to-left, dark mode and motion that stays smooth.';
	// Structured data: tells search and AI engines what this is, and where to learn more.
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'SoftwareSourceCode',
			name: 'Sina UI',
			description,
			url: root(page.url),
			programmingLanguage: ['Svelte', 'TypeScript'],
			runtimePlatform: 'SvelteKit',
			keywords: 'Svelte, Svelte 5, SvelteKit, components, accessible, UI library',
			isAccessibleForFree: true
		}).replace(/</g, '\\u003c')
	);
	// Split so this script block doesn't end early; `<` inside the JSON is escaped above.
	const ldTag = $derived(`<script type="application/ld+json">${jsonLd}</` + 'script>');
</script>

<svelte:head>
	<title>Sina UI — Accessible Svelte components that feel finished</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Sina UI — Accessible Svelte components that feel finished" />
	<meta property="og:description" content={description} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- our own JSON, with < escaped -->
	{@html ldTag}
</svelte:head>

<section class="hero">
	<div class="pitch">
		<a class="note" href={resolve('/pro')}>
			<span class="new">Pro</span>
			{counts.templates} templates, ready to ship
			<Icon icon={ArrowRight01Icon} size={14} />
		</a>
		<h1>Svelte components that feel finished</h1>
		<p>
			Copy them into your project and own the code. Keyboard, screen reader, right-to-left and dark
			mode in every one, with motion that stays smooth.
		</p>
		<div class="actions">
			<Button href={resolve('/docs')}>Get started</Button>
			<span class="cmd">
				<code>{install}</code>
				<CopyButton value={install} variant="ghost" size="sm" square />
			</span>
		</div>
		<dl class="stats">
			{#each stats as s (s.label)}
				<div>
					<dt>{s.label}</dt>
					<dd>{s.n}</dd>
				</div>
			{/each}
		</dl>
	</div>
	<!-- Real components, working: the hero is a demo, not a picture. -->
	<div class="stage">
		<form class="card" onsubmit={(e) => e.preventDefault()}>
			<p class="card-title">Reading room</p>
			<Input label="Name" bind:value={room} />
			<SegmentedControl
				label="Open"
				fill
				options={[
					{ value: 'day', label: 'Day' },
					{ value: 'evening', label: 'Evening' },
					{ value: 'night', label: 'Night' }
				]}
				bind:value={hours}
			/>
			<Switch bind:checked={alerts}>Tell readers when a seat frees up</Switch>
			<div class="card-actions">
				<Button
					variant="secondary"
					onclick={() => {
						room = 'Bayt al-Ḥikma';
						hours = 'day';
						alerts = true;
					}}>Cancel</Button
				>
				<Button type="submit">Save</Button>
			</div>
		</form>
	</div>
</section>

<section class="grid" aria-label="Components">
	{#each tiles as tile (tile.href)}
		{@const Demo = tile.demo}
		<article class={['tile', tile.wide && 'wide']}>
			<div class="demo"><Demo /></div>
			<a class="caption" href={link(tile.href)}>{tile.title}</a>
		</article>
	{/each}
</section>

<section class="pro">
	<Badge tone="accent" icon={false}>Pro</Badge>
	<h2>Blocks and templates, ready to ship</h2>
	<p>
		Larger blocks and complete apps built from the same components. One price, paid once, shown
		before you buy.
	</p>
	<ul>
		<li>
			<a href={resolve('/pro/pricing')}>
				<strong>Pricing</strong>
				<span>Plans with a billing switch and prices that roll.</span>
			</a>
		</li>
		<li>
			<a href={resolve('/pro/saas-landing')}>
				<strong>SaaS landing page</strong>
				<span>Hero, features, pricing and questions: a product site, ready to rename.</span>
			</a>
		</li>
		<li>
			<a href={resolve('/pro/saas-app')}>
				<strong>SaaS app</strong>
				<span>Sidebar app with dashboard, invoices and full account management.</span>
			</a>
		</li>
	</ul>
</section>

<footer>
	<span>Sina UI · MIT licensed</span>
	<a href={resolve('/changelog')}>Changelog</a>
</footer>

<style>
	section,
	footer {
		box-sizing: border-box;
		inline-size: min(76rem, 100% - 2rem);
		margin-inline: auto;
	}
	/* Words on the left, a working card on the right over a faint dot grid. */
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		align-items: center;
		gap: clamp(2rem, 5vw, 4rem);
		padding-block: clamp(3rem, 8vw, 6rem) clamp(2.5rem, 6vw, 4.5rem);
	}
	@media (width < 56rem) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.pitch {
		display: grid;
		justify-items: start;
		gap: 1.125rem;
	}
	.pitch > *,
	.stage {
		animation: mount 700ms var(--ui-ease-enter) both;
	}
	.pitch > :nth-child(2) {
		animation-delay: 50ms;
	}
	.pitch > :nth-child(3) {
		animation-delay: 100ms;
	}
	.pitch > :nth-child(n + 4),
	.stage {
		animation-delay: 150ms;
	}
	@keyframes mount {
		from {
			opacity: 0;
			translate: 0 8px;
		}
	}
	.note {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.1875rem 0.625rem 0.1875rem 0.1875rem;
		border-radius: 999px;
		background: var(--ui-surface);
		box-shadow:
			0 0 0 1px var(--ui-line),
			var(--ui-shadow-xs);
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-weight: 500;
		text-decoration: none;
		transition: color var(--ui-dur-press) ease;
	}
	.new {
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		font-size: 0.75rem;
	}
	@media (hover: hover) {
		.note:hover {
			color: var(--ui-fg);
		}
	}
	.hero h1 {
		max-inline-size: 14ch;
		margin: 0;
		font-size: clamp(2rem, 4.5vw, 3rem);
		font-weight: 600;
		line-height: 1.08;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}
	.pitch p {
		max-inline-size: 30rem;
		margin: 0;
		color: var(--ui-muted);
		font-size: 1rem;
		text-wrap: pretty;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-block-start: 0.25rem;
	}
	.cmd {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		min-block-size: var(--ui-control-h);
		padding-inline: 0.75rem 0.25rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
	}
	.cmd code {
		padding: 0;
		background: none;
		font: 0.8125rem var(--ui-font-mono);
	}
	.stats {
		display: flex;
		gap: 2rem;
		margin: 0.75rem 0 0;
	}
	.stats div {
		display: flex;
		flex-direction: column-reverse;
	}
	.stats dd {
		margin: 0;
		font: 500 1.25rem/1.2 var(--ui-font-mono);
		font-variant-numeric: tabular-nums;
	}
	.stats dt {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.stage {
		display: grid;
		place-items: center;
		padding: clamp(1.5rem, 4vw, 3rem);
		border-radius: calc(var(--ui-radius) * 2);
		background:
			radial-gradient(circle, var(--ui-field-line) 1px, transparent 1.5px) 0 0 / 1.25rem 1.25rem,
			var(--ui-subtle);
	}
	.card {
		display: grid;
		gap: 1rem;
		inline-size: min(100%, 22rem);
		padding: 1.25rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
	.card-title {
		margin: 0;
		font-weight: 600;
	}
	.card-actions {
		display: flex;
		justify-content: end;
		gap: 0.5rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
		grid-auto-flow: dense;
		gap: 1rem;
		margin-block-start: 1rem;
	}
	.tile {
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) * 2);
		background: var(--ui-subtle);
	}
	@media (width >= 48rem) {
		.wide {
			grid-column: span 2;
		}
	}
	/* Each tile rises in as it scrolls into view; tiles already on screen stay put. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.tile {
				animation: reveal linear both;
				animation-timeline: view();
				animation-range: entry 0 entry 200px;
			}
		}
	}
	@keyframes reveal {
		from {
			opacity: 0;
			translate: 0 32px;
		}
	}
	.demo {
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		align-content: center;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		min-block-size: 14rem;
		padding: 1.5rem;
	}
	.demo > :global(*) {
		max-inline-size: 100%;
	}
	.caption {
		padding: 0 1.25rem 1rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		transition: color var(--ui-dur-press) ease;
	}
	@media (hover: hover) {
		.caption:hover {
			color: var(--ui-fg);
		}
	}

	.pro {
		display: grid;
		justify-items: start;
		gap: 0.75rem;
		margin-block-start: 5rem;
	}
	.pro h2 {
		margin: 0;
		font-size: clamp(1.5rem, 3.5vw, 2.25rem);
		letter-spacing: -0.02em;
	}
	.pro p {
		max-inline-size: 36rem;
		margin: 0;
		color: var(--ui-muted);
	}
	.pro ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
		gap: 1rem;
		inline-size: 100%;
		margin: 0.75rem 0 0;
		padding: 0;
		list-style: none;
	}
	.pro a {
		display: grid;
		gap: 0.25rem;
		block-size: 100%;
		box-sizing: border-box;
		padding: 1.25rem;
		border-radius: calc(var(--ui-radius) * 2);
		background: color-mix(in srgb, var(--ui-accent) 7%, transparent);
		color: var(--ui-fg);
		text-decoration: none;
		transition: translate var(--ui-dur) var(--ui-ease-out);
	}
	.pro a span {
		color: var(--ui-muted);
		font-size: 0.9375rem;
	}
	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		.pro a:hover {
			translate: 0 -2px;
		}
	}
	.pro a:active {
		scale: 0.99;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem;
		margin-block-start: 5rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	footer a {
		color: inherit;
	}
	@media (prefers-reduced-motion: reduce) {
		.hero > * {
			animation: none;
		}
	}
</style>
