<script lang="ts">
	import { onMount } from 'svelte';
	import { CenterFocusIcon, MinusSignIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { inView } from './in-view';
	import { pop, reduced } from './motion';

	interface Datum {
		/** ISO 3166-1 alpha-2 ("DE"). Anything else (an "Other" row) is left out. */
		code: string;
		value: number;
		/** Shown in place of the country's own name. */
		label?: string;
	}
	interface Props {
		data: Datum[];
		/** Names the map and its table of values for screen readers. */
		title: string;
		/** One sentence on what it shows, read after the title. */
		description?: string;
		/** The value column's heading in the table read by screen readers. */
		valueLabel?: string;
		format?: (value: number) => string;
		/** Show each country's share of the total; turn it off for rates and scores. */
		share?: boolean;
		/** Called with a country's code when it's clicked, tapped or pressed with Enter. */
		onselect?: (code: string) => void;
		/** The chosen country's code, outlined. */
		selected?: string | null;
		/** "Happening now": a soft pulsing dot on each country, sized by value. */
		pings?: { code: string; value?: number }[];
		/** Shown over the map when there's no data. */
		empty?: string;
		class?: string;
	}

	const count = new Intl.NumberFormat('en-US').format;
	let {
		data,
		title,
		description,
		valueLabel = 'Value',
		format = count,
		share = true,
		onselect,
		selected = null,
		pings = [],
		empty = 'Nothing to show yet.',
		class: className
	}: Props = $props();
	const id = $props.id();

	// The outlines are 40 KB gzipped, so they load with the first map on screen, not with the page.
	// The size matches world-map-shapes.ts (a test checks), so the space is held before they arrive.
	const [W, H] = [960, 418];
	let geo = $state.raw<typeof import('./world-map-shapes') | null>(null);
	let failed = $state(false);
	const loadShapes = () => {
		failed = false;
		import('./world-map-shapes').then(
			(m) => (geo = m),
			(err) => {
				console.error('WorldMap: the country outlines failed to load', err);
				failed = true;
			}
		);
	};
	onMount(loadShapes);

	const names = new Intl.DisplayNames(['en-US'], { type: 'region' });
	const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
	const nameOf = (code: string) => {
		try {
			return names.of(code) ?? code;
		} catch {
			return code;
		}
	};

	const rows = $derived(
		data
			.filter((d) => /^[a-z]{2}$/i.test(d.code) && Number.isFinite(d.value))
			.map((d) => ({
				...d,
				code: d.code.toUpperCase(),
				name: d.label ?? nameOf(d.code.toUpperCase())
			}))
			.sort((a, b) => b.value - a.value)
	);
	const byCode = $derived(new Map(rows.map((r) => [r.code, r])));
	const total = $derived(rows.reduce((n, r) => n + r.value, 0));
	const lo = $derived(rows.length ? rows[rows.length - 1].value : 0);
	const hi = $derived(rows.length ? rows[0].value : 0);
	// Five steps of ink on a square-root scale, so one big country doesn't wash out the rest.
	const STEPS = 5;
	const step = (v: number) => {
		const span = Math.sqrt(Math.max(hi, 0)) - Math.sqrt(Math.max(lo, 0));
		if (span <= 0) return STEPS;
		const t = (Math.sqrt(Math.max(v, 0)) - Math.sqrt(Math.max(lo, 0))) / span;
		return 1 + Math.min(STEPS - 1, Math.floor(t * STEPS));
	};
	const shareOf = (v: number) => (share && total > 0 ? percent.format(v / total) : '');
	const describe = (r: (typeof rows)[number]) =>
		[r.name, format(r.value), shareOf(r.value)].filter(Boolean).join(', ');

	// Where each code is drawn: an outline's label point, or a small country's dot.
	const points = $derived(
		new Map(
			[
				...(geo?.shapes ?? []).filter(([code]) => code).map(([c, , x, y]) => [c, x, y]),
				...(geo?.dots ?? [])
			].map(([c, x, y]): [string, [number, number]] => [c as string, [x as number, y as number]])
		)
	);
	const dots = $derived(geo ? geo.dots.filter(([code]) => byCode.has(code)) : []);
	// Arrow keys walk the countries with data, most first.
	const order = $derived(rows.filter((r) => points.has(r.code)).map((r) => r.code));
	let current = $state<string | null>(null);
	const tabStop = $derived(current && order.includes(current) ? current : order[0]);

	// The view: zoom k (1–8) and the offset, in map units.
	const MAX_ZOOM = 8;
	let k = $state(1);
	let tx = $state(0);
	let ty = $state(0);
	let smooth = $state(false);
	let svg = $state<SVGSVGElement>();
	let width = $state(0);
	const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
	function setView(k2: number, x: number, y: number, animate = false) {
		smooth = animate && !reduced();
		k = clamp(k2, 1, MAX_ZOOM);
		tx = clamp(x, W - W * k, 0);
		ty = clamp(y, H - H * k, 0);
	}
	/** Zooms by `factor`, keeping the map point (x, y) where it is on screen. */
	function zoomAt(factor: number, x = W / 2, y = H / 2, animate = true) {
		const k2 = clamp(k * factor, 1, MAX_ZOOM);
		const f = k2 / k;
		setView(k2, x - (x - tx) * f, y - (y - ty) * f, animate);
	}
	const reset = () => setView(1, 0, 0, true);
	// Map units per screen pixel at the current zoom, so dots and pings keep their size on screen.
	const px = $derived(width ? W / width / k : 1);
	const toMap = (clientX: number, clientY: number) => {
		const r = svg!.getBoundingClientRect();
		return [((clientX - r.left) * W) / r.width, ((clientY - r.top) * H) / r.height] as const;
	};

	// The tooltip, at the pointer or at a focused country's label point; px from the map's corner.
	let tip = $state<{ code: string; x: number; y: number } | null>(null);
	let tipW = $state(0);
	let tipH = $state(0);
	const tipRow = $derived(tip ? byCode.get(tip.code) : undefined);
	const pingOf = (code: string) => pings.find((p) => p.code.toUpperCase() === code);
	function tipAtPoint(code: string) {
		const p = points.get(code);
		if (!p || !width) return;
		const s = width / W;
		tip = { code, x: (tx + p[0] * k) * s, y: (ty + p[1] * k) * s };
	}
	const codeAt = (t: EventTarget | null) =>
		(t instanceof Element && t.closest<SVGElement>('[data-code]')?.dataset.code) || null;

	// Pointers: one drags a zoomed map, two pinch. A press that moves more than a few px is a drag, not a click.
	// Plain, not reactive: only the gesture math reads it.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const pointers = new Map<number, { x: number; y: number }>();
	let start: { k: number; x: number; y: number; pts: { x: number; y: number }[] } | null = null;
	let moved = false;
	const restart = () => (start = { k, x: tx, y: ty, pts: [...pointers.values()] });
	function down(e: PointerEvent) {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.size === 1) moved = false;
		restart();
	}
	function move(e: PointerEvent) {
		if (!pointers.has(e.pointerId)) {
			if (e.pointerType !== 'mouse') return;
			const code = codeAt(e.target);
			const r = svg!.getBoundingClientRect();
			tip = code ? { code, x: e.clientX - r.left, y: e.clientY - r.top } : null;
			return;
		}
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		const pts = [...pointers.values()];
		if (!start || start.pts.length !== pts.length) return;
		if (pts.length === 1) {
			const dx = pts[0].x - start.pts[0].x;
			const dy = pts[0].y - start.pts[0].y;
			if (!moved && Math.hypot(dx, dy) < 4) return;
			moved = true;
			tip = null;
			if (start.k === 1) return;
			svg!.setPointerCapture(e.pointerId);
			const s = W / svg!.getBoundingClientRect().width;
			setView(start.k, start.x + dx * s, start.y + dy * s);
		} else if (pts.length === 2) {
			moved = true;
			tip = null;
			const gap = (p: typeof pts) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1;
			const mid = (p: typeof pts) => toMap((p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
			const [m0x, m0y] = mid(start.pts);
			const [m1x, m1y] = mid(pts);
			const k2 = clamp((start.k * gap(pts)) / gap(start.pts), 1, MAX_ZOOM);
			const f = k2 / start.k;
			setView(k2, m1x - (m0x - start.x) * f, m1y - (m0y - start.y) * f);
		}
	}
	function up(e: PointerEvent) {
		pointers.delete(e.pointerId);
		restart();
	}
	function click(e: MouseEvent) {
		// A double-click's second click zooms; it doesn't select again.
		if (moved || e.detail > 1) return;
		const code = codeAt(e.target);
		if (!code || !byCode.has(code)) return;
		current = code;
		if (!tip) tipAtPoint(code);
		onselect?.(code);
	}
	function dblclick(e: MouseEvent) {
		const [x, y] = toMap(e.clientX, e.clientY);
		zoomAt(e.shiftKey ? 0.5 : 2, x, y);
	}
	// Ctrl + wheel (and a trackpad pinch) zooms; a plain wheel still scrolls the page. Not passive, to keep the page still.
	const wheel = (node: SVGSVGElement) => {
		const on = (e: WheelEvent) => {
			if (!e.ctrlKey && !e.metaKey) return;
			e.preventDefault();
			const [x, y] = toMap(e.clientX, e.clientY);
			zoomAt(Math.exp(-e.deltaY * 0.01), x, y, false);
		};
		node.addEventListener('wheel', on, { passive: false });
		return () => node.removeEventListener('wheel', on);
	};

	function focusCode(code: string) {
		current = code;
		svg?.querySelector<SVGElement>(`[data-code="${code}"][tabindex]`)?.focus();
	}
	function focusin(e: FocusEvent) {
		const code = codeAt(e.target);
		if (!code) return;
		current = code;
		const p = points.get(code);
		// Zoomed in, a country off screen slides into the middle.
		if (p && k > 1) {
			const [x, y] = [tx + p[0] * k, ty + p[1] * k];
			if (x < 0 || x > W || y < 0 || y > H) setView(k, W / 2 - p[0] * k, H / 2 - p[1] * k, true);
		}
		// A click's tooltip follows the pointer; a keyboard's sits on the country.
		if ((e.target as Element).matches(':focus-visible')) tipAtPoint(code);
	}
	function keydown(e: KeyboardEvent) {
		const code = codeAt(e.target);
		if (!code) return;
		const i = order.indexOf(code);
		const go = {
			ArrowRight: i + 1,
			ArrowDown: i + 1,
			ArrowLeft: i - 1,
			ArrowUp: i - 1,
			Home: 0,
			End: order.length - 1
		}[e.key];
		const p = points.get(code);
		if (go !== undefined) {
			// The browser may not count script focus as keyboard focus (say, after a click), so show the tooltip here.
			const next = order[clamp(go, 0, order.length - 1)];
			focusCode(next);
			tipAtPoint(next);
		} else if (e.key === 'Enter' || e.key === ' ') onselect?.(code);
		else if ((e.key === '+' || e.key === '=') && p) zoomAt(2, ...p);
		else if (e.key === '-' && p) zoomAt(0.5, ...p);
		else if (e.key === '0') reset();
		else if (e.key === 'Escape') tip = null;
		else return;
		e.preventDefault();
		// Zooming moves the country under its tooltip.
		if (['+', '=', '-', '0'].includes(e.key)) requestAnimationFrame(() => tipAtPoint(code));
	}

	// Countries fade in west to east the first time the map is on screen; reduced motion shows them at once.
	let revealed = $state(false);
	const reveal = inView(() => (revealed = true), { threshold: 0.2 });
	onMount(() => {
		if (reduced()) revealed = true;
	});

	const pingMax = $derived(Math.max(1, ...pings.map((p) => p.value ?? 1)));
	const pingDots = $derived(
		pings
			.map((p) => ({ ...p, code: p.code.toUpperCase(), at: points.get(p.code.toUpperCase()) }))
			.filter((p): p is typeof p & { at: [number, number] } => !!p.at)
	);
	const swatches = Array.from({ length: STEPS }, (_, i) => i + 1);
</script>

<div class={['world-map', className]} bind:clientWidth={width}>
	<p class="sr-only" id="{id}-desc">
		{description}
		{#if order.length}
			Arrow keys move between countries, most first{onselect ? '; Enter selects one' : ''}. Plus and
			minus zoom, 0 shows the whole map.
		{/if}
	</p>
	<div class="frame">
		{#if geo}
			<!-- Clicks, keys and pointers are handled once here for every country; each country is focusable. -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<svg
				bind:this={svg}
				viewBox="0 0 {W} {H}"
				role="group"
				aria-label={title}
				aria-describedby="{id}-desc"
				class={['map', revealed && 'revealed', k > 1 && 'zoomed']}
				{@attach reveal}
				{@attach wheel}
				onpointerdown={down}
				onpointermove={move}
				onpointerup={up}
				onpointercancel={up}
				onpointerleave={(e) => e.pointerType === 'mouse' && !pointers.size && (tip = null)}
				onclick={click}
				ondblclick={dblclick}
				onkeydown={keydown}
				onfocusin={focusin}
				onfocusout={() => (tip = null)}
			>
				<g
					class={['view', smooth && 'smooth']}
					style:transform="translate({tx}px, {ty}px) scale({k})"
				>
					{#each geo.shapes as [code, d, cx], i (i)}
						{@const r = byCode.get(code)}
						<!-- Focusable even without onselect: keyboard users read and zoom to countries one by one. -->
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<path
							{d}
							data-code={code || undefined}
							class={['land', r && `s${step(r.value)}`, code === selected && 'picked']}
							style:--delay="{Math.round((cx / W) * 500)}ms"
							tabindex={r ? (code === tabStop ? 0 : -1) : undefined}
							role={r ? (onselect ? 'button' : 'img') : undefined}
							aria-label={r ? describe(r) : undefined}
						/>
					{/each}
					{#each dots as [code, x, y] (code)}
						{@const r = byCode.get(code)!}
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<circle
							cx={x}
							cy={y}
							r={3 * px}
							data-code={code}
							class={['land dot', `s${step(r.value)}`, code === selected && 'picked']}
							style:--delay="{Math.round((x / W) * 500)}ms"
							tabindex={code === tabStop ? 0 : -1}
							role={onselect ? 'button' : 'img'}
							aria-label={describe(r)}
						/>
					{/each}
					{#each pingDots as p (p.code)}
						{@const r = (2.5 + 2.5 * Math.sqrt((p.value ?? 1) / pingMax)) * px}
						<g transform="translate({p.at[0]} {p.at[1]})" class="ping">
							<g transition:pop>
								<circle class="pulse" {r} />
								<circle class="core" {r} />
							</g>
						</g>
					{/each}
				</g>
			</svg>
			{#if !rows.length}<p class="empty">{empty}</p>{/if}
		{:else if failed}
			<div class="empty">
				<p>The map couldn't load.</p>
				<Button size="sm" variant="outline" onclick={loadShapes}>Try again</Button>
			</div>
		{/if}
		{#if tip}
			{@const ping = pingOf(tip.code)}
			<div
				class="tip"
				aria-hidden="true"
				bind:offsetWidth={tipW}
				bind:offsetHeight={tipH}
				style:left="{clamp(tip.x, tipW / 2 + 4, width - tipW / 2 - 4)}px"
				style:top="{tip.y < tipH + 16 ? tip.y + 16 : tip.y - tipH - 12}px"
			>
				<strong>{tipRow?.name ?? nameOf(tip.code)}</strong>
				{#if tipRow}
					<span class="num">{format(tipRow.value)}</span>
					{#if shareOf(tipRow.value)}<span class="muted">{shareOf(tipRow.value)} of total</span
						>{/if}
				{:else}
					<span class="muted">No data</span>
				{/if}
				{#if ping}<span class="now">{format(ping.value ?? 1)} now</span>{/if}
			</div>
		{/if}
		{#if geo}
			<div class="controls">
				<Button size="sm" variant="secondary" square aria-label="Zoom in" onclick={() => zoomAt(2)}
					><Icon icon={PlusSignIcon} size={16} /></Button
				>
				<Button
					size="sm"
					variant="secondary"
					square
					aria-label="Zoom out"
					disabled={k <= 1}
					onclick={() => zoomAt(0.5)}><Icon icon={MinusSignIcon} size={16} /></Button
				>
				{#if k > 1}
					<Button
						size="sm"
						variant="secondary"
						square
						aria-label="Show the whole map"
						onclick={reset}><Icon icon={CenterFocusIcon} size={16} /></Button
					>
				{/if}
			</div>
		{/if}
	</div>
	{#if rows.length}
		<div class="legend" aria-hidden="true">
			<span class="num">{format(lo)}</span>
			<span class="ramp"
				>{#each swatches as s (s)}<i class="s{s}"></i>{/each}</span
			>
			<span class="num">{format(hi)}</span>
			<span class="none"><i></i>No data</span>
		</div>
		<table class="sr-only">
			<caption>{title}</caption>
			<thead>
				<tr>
					<th scope="col">Country</th>
					<th scope="col">{valueLabel}</th>
					{#if share}<th scope="col">Share</th>{/if}
				</tr>
			</thead>
			<tbody>
				{#each rows as r (r.code)}
					<tr>
						<th scope="row">{r.name}</th>
						<td>{format(r.value)}</td>
						{#if share}<td>{shareOf(r.value)}</td>{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
	{#if pingDots.length}
		<p class="sr-only">
			Now: {pingDots.map((p) => `${nameOf(p.code)} ${format(p.value ?? 1)}`).join(', ')}.
		</p>
	{/if}
</div>

<style>
	.world-map {
		/* The scale: five steps of ink into the surface, and a faint fill for countries without data. */
		--map-1: color-mix(in oklab, var(--ui-accent) 22%, var(--ui-surface));
		--map-2: color-mix(in oklab, var(--ui-accent) 38%, var(--ui-surface));
		--map-3: color-mix(in oklab, var(--ui-accent) 55%, var(--ui-surface));
		--map-4: color-mix(in oklab, var(--ui-accent) 73%, var(--ui-surface));
		--map-5: color-mix(in oklab, var(--ui-accent) 90%, var(--ui-surface));
		--map-none: color-mix(in oklab, var(--ui-fg) 6%, var(--ui-surface));
		display: grid;
		gap: 0.75rem;
		inline-size: 100%;
		min-inline-size: 0;
	}
	.frame {
		position: relative;
		aspect-ratio: 960 / 418;
		overflow: hidden;
		border-radius: var(--ui-radius-control);
	}
	.map {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		/* One finger scrolls the page until the map is zoomed; then it pans the map. Two fingers pinch. */
		touch-action: pan-x pan-y;
		user-select: none;
		-webkit-user-select: none;
	}
	.map.zoomed {
		touch-action: none;
		cursor: grab;
	}
	.map.zoomed:active {
		cursor: grabbing;
	}
	.view {
		transform-origin: 0 0;
	}
	.view.smooth {
		transition: transform var(--ui-dur-spring) var(--ui-ease-out);
	}
	.land {
		fill: var(--map-none);
		stroke: var(--ui-surface);
		stroke-width: 0.5;
		vector-effect: non-scaling-stroke;
		outline: none;
		opacity: 0;
	}
	.revealed .land {
		opacity: 1;
		animation: land-in 480ms var(--ui-ease-out) var(--delay) backwards;
	}
	@keyframes land-in {
		from {
			opacity: 0;
		}
	}
	.s1 {
		fill: var(--map-1);
	}
	.s2 {
		fill: var(--map-2);
	}
	.s3 {
		fill: var(--map-3);
	}
	.s4 {
		fill: var(--map-4);
	}
	.s5 {
		fill: var(--map-5);
	}
	.land[data-code] {
		cursor: default;
	}
	.land[tabindex] {
		cursor: pointer;
	}
	.land[tabindex]:hover,
	.land.picked {
		stroke: var(--ui-fg);
		stroke-width: 1.5;
	}
	.land:focus-visible {
		stroke: var(--ui-ring);
		stroke-width: var(--ui-ring-width);
	}
	.dot {
		stroke: var(--ui-surface);
		stroke-width: 1;
	}
	.ping {
		pointer-events: none;
	}
	.core {
		fill: var(--ui-accent);
		stroke: var(--ui-surface);
		stroke-width: 1.5;
		vector-effect: non-scaling-stroke;
	}
	.pulse {
		transform-box: fill-box;
		transform-origin: center;
		fill: var(--ui-accent);
		opacity: 0;
		animation: pulse 2400ms var(--ui-ease-out) infinite;
	}
	@keyframes pulse {
		from {
			transform: scale(1);
			opacity: 0.45;
		}
		to {
			transform: scale(3.5);
			opacity: 0;
		}
	}
	.tip {
		position: absolute;
		z-index: 1;
		display: grid;
		gap: 0.125rem;
		padding: 0.375rem 0.625rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface-overlay);
		box-shadow: var(--ui-shadow-overlay);
		color: var(--ui-fg);
		font-size: 0.8125rem;
		line-height: 1.35;
		white-space: nowrap;
		pointer-events: none;
		translate: -50% 0;
	}
	.tip strong {
		font-weight: 500;
	}
	.num {
		font-variant-numeric: tabular-nums;
	}
	.muted,
	.now {
		color: var(--ui-muted);
	}
	.controls {
		position: absolute;
		inset-block-end: 0.5rem;
		inset-inline-start: 0.5rem;
		display: flex;
		gap: 0.25rem;
	}
	.empty {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		text-align: center;
	}
	.empty p {
		margin: 0;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	.ramp {
		display: flex;
	}
	.legend i {
		display: block;
		inline-size: 1.25rem;
		block-size: 0.5rem;
		background: var(--map-none);
	}
	.ramp i:first-child {
		border-start-start-radius: 0.25rem;
		border-end-start-radius: 0.25rem;
	}
	.ramp i:last-child {
		border-start-end-radius: 0.25rem;
		border-end-end-radius: 0.25rem;
	}
	.ramp .s1 {
		background: var(--map-1);
	}
	.ramp .s2 {
		background: var(--map-2);
	}
	.ramp .s3 {
		background: var(--map-3);
	}
	.ramp .s4 {
		background: var(--map-4);
	}
	.ramp .s5 {
		background: var(--map-5);
	}
	.none {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		margin-inline-start: auto;
	}
	.none i {
		inline-size: 0.75rem;
		border-radius: 0.125rem;
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.revealed .land,
		.pulse {
			animation: none;
		}
		.view.smooth {
			transition: none;
		}
	}
</style>
