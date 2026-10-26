<script lang="ts" module>
	export type Announcement = {
		text: string;
		/** A short label before the text, such as "New". */
		tag?: string;
		/** A call to action: a link with href, or a button with onclick. */
		link?: string;
		href?: string;
		onclick?: () => void;
		/** A live countdown to a moment, e.g. the end of a sale. */
		countdown?: { to: Date | string | number; label?: string };
	};
</script>

<script lang="ts">
	import { ArrowRight02Icon, Cancel01Icon, PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { ms } from './motion';
	import RollingNumber from './RollingNumber.svelte';
	import { load, save } from './stored';

	interface Props {
		/** One message, or several that take turns. */
		messages: Announcement[];
		/** inverted: dark on a light page (light on a dark one). */
		tone?: 'inverted' | 'accent' | 'neutral' | 'warning';
		/** Remembers a dismissal in this browser under this key; change the key to show a new one. */
		persist?: string;
		dismissible?: boolean;
		/** Milliseconds each message shows when there are several. */
		interval?: number;
		label?: string;
		ondismiss?: () => void;
		class?: string;
	}

	let {
		messages,
		tone = 'inverted',
		persist,
		dismissible = true,
		interval = 6000,
		label = 'Announcements',
		ondismiss,
		class: className
	}: Props = $props();

	let open = $state(true);
	let gone = $state(false);
	let current = $state(0);
	let left = $state<number>();
	// Held by hover or focus (to read), or by the pause button (for good).
	let held = $state(false);
	let paused = $state(false);
	let now = $state(Date.now());

	onMount(() => {
		if (persist && load(persist, false)) gone = true;
	});

	// The progress bar's own animation is the timer: when it completes, the next message comes.
	// Pausing it pauses both, so the bar always shows exactly how long is left.
	function next() {
		left = current;
		current = (current + 1) % messages.length;
	}

	const hasCountdown = $derived(messages.some((m) => m.countdown));
	$effect(() => {
		if (!hasCountdown) return;
		const t = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(t);
	});
	const pad = (n: number) => String(n).padStart(2, '0');
	function remaining(to: Date | string | number) {
		const s = Math.max(0, Math.floor((new Date(to).getTime() - now) / 1000));
		return {
			done: s === 0,
			d: Math.floor(s / 86400),
			h: pad(Math.floor(s / 3600) % 24),
			m: pad(Math.floor(s / 60) % 60),
			s: pad(s % 60)
		};
	}
	const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

	function dismiss() {
		open = false;
		// Leaves the page once it has folded shut.
		setTimeout(() => (gone = true), ms(360));
		if (persist) save(persist, true);
		ondismiss?.();
	}
</script>

{#if !gone}
	<!-- Dismissed, it fades, then folds shut (rows 1fr → 0fr) so the page closes up under it. -->
	<section
		class={['announcement', tone, !open && 'closing', className]}
		aria-label={label}
		onpointerenter={() => (held = true)}
		onpointerleave={() => (held = false)}
		onfocusin={() => (held = true)}
		onfocusout={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && (held = false)}
	>
		<div class="inner">
			<div class="bar">
				<div class="viewport">
					{#each messages as m, i (i)}
						<div
							class={['face', i === current && 'on', i === left && 'left']}
							role="group"
							aria-label="{i + 1} of {messages.length}"
							aria-hidden={i !== current}
							inert={i !== current}
						>
							<p class="message">
								{#if m.tag}<span class="tag">{m.tag}</span>{/if}
								<span class="text">{m.text}</span>
								{#if m.countdown}
									{@const r = remaining(m.countdown.to)}
									{#if !r.done}
										<span class="countdown">
											<span class="sr">
												{m.countdown.label ?? 'Ends'}
												{when.format(new Date(m.countdown.to))}
											</span>
											<span aria-hidden="true">{m.countdown.label ?? 'Ends in'}</span>
											<span class="time" aria-hidden="true">
												{#if r.d}<RollingNumber value={r.d} /><span class="unit">d</span><span
														class="gap"
													></span>{/if}<RollingNumber value={r.h} /><span class="sep">:</span
												><RollingNumber value={r.m} /><span class="sep">:</span><RollingNumber
													value={r.s}
												/>
											</span>
										</span>
									{/if}
								{/if}
								{#if m.link && (m.href || m.onclick)}
									{#if m.href}
										<a class="cta" href={m.href} onclick={m.onclick}
											>{m.link}<Icon icon={ArrowRight02Icon} size={14} /></a
										>
									{:else}
										<button type="button" class="cta" onclick={m.onclick}
											>{m.link}<Icon icon={ArrowRight02Icon} size={14} /></button
										>
									{/if}
								{/if}
							</p>
						</div>
					{/each}
				</div>

				{#if messages.length > 1}
					<!-- A hairline per message along the bottom edge; the current one fills until the next. -->
					<div class="steps" aria-hidden="true">
						{#each messages as _, i (i)}
							<span class={['step', i < current && 'past']}>
								{#if i === current}
									{#key current}
										<span
											class="run"
											style:animation-duration="{interval}ms"
											style:animation-play-state={held || paused || !open ? 'paused' : 'running'}
											onanimationend={next}
										></span>
									{/key}
								{/if}
							</span>
						{/each}
					</div>
				{/if}
				{#if messages.length > 1}
					<button
						type="button"
						class="icon pause"
						aria-label={paused ? 'Play announcements' : 'Pause announcements'}
						onclick={() => (paused = !paused)}
					>
						<Icon icon={paused ? PlayIcon : PauseIcon} size={14} />
					</button>
				{/if}
				{#if dismissible}
					<button type="button" class="icon close" aria-label="Dismiss" onclick={dismiss}>
						<Icon icon={Cancel01Icon} size={16} />
					</button>
				{/if}
			</div>
		</div>
	</section>
{/if}

<style>
	/* A slim strip across the top of the page: one centered line, a small button, close at the end. */
	.announcement {
		--bg: var(--ui-fg);
		--fg: var(--ui-bg);
		--muted: color-mix(in srgb, var(--ui-bg) 62%, transparent);
		--edge: color-mix(in srgb, var(--ui-bg) 28%, transparent);
		/* Text on the button, which is filled with --fg. */
		--on-fg: var(--ui-fg);
		display: grid;
		grid-template-rows: 1fr;
		color: var(--fg);
		font: 0.8125rem/1.4 var(--ui-font);
		transition:
			grid-template-rows var(--ui-dur-overlay) var(--ui-ease-out) 80ms,
			opacity var(--ui-dur-exit) ease;
	}
	.accent {
		--bg: color-mix(in srgb, var(--ui-accent) 8%, var(--ui-surface));
		--fg: color-mix(in srgb, var(--ui-accent) 75%, var(--ui-fg));
		--muted: color-mix(in srgb, var(--fg) 75%, transparent);
	}
	.neutral {
		--bg: var(--ui-subtle);
		--fg: var(--ui-fg);
		--muted: var(--ui-muted);
	}
	.warning {
		--bg: color-mix(in srgb, var(--ui-warning) 10%, var(--ui-surface));
		--fg: color-mix(in srgb, var(--ui-warning) 85%, var(--ui-fg));
		--muted: color-mix(in srgb, var(--fg) 75%, transparent);
	}
	.accent,
	.neutral,
	.warning {
		--edge: var(--ui-field-line);
		--on-fg: var(--ui-surface);
	}
	.closing {
		grid-template-rows: 0fr;
		opacity: 0;
	}
	.inner {
		min-block-size: 0;
		overflow: hidden;
	}
	/* Three columns, the outer two equal, so the message sits at the true center. */
	.bar {
		position: relative;
		display: grid;
		grid-template-columns: minmax(2rem, 1fr) minmax(0, auto) minmax(2rem, 1fr);
		grid-template-areas: 'start center end';
		align-items: center;
		column-gap: 0.5rem;
		min-block-size: 2.5rem;
		padding: 0.25rem 0.5rem;
		/* Invisible normally; outlines it in Windows High Contrast. */
		border-block-end: 1px solid transparent;
		background: var(--bg);
	}
	.pause {
		grid-area: start;
		justify-self: start;
	}
	.close {
		grid-area: end;
		justify-self: end;
	}

	/* Every message in one cell, so the strip keeps the tallest one's height and never jumps. The
	   old one lifts away as the next rises from below, like a ticker. */
	.viewport {
		display: grid;
		grid-area: center;
		min-inline-size: 0;
		overflow: hidden;
	}
	.face {
		display: flex;
		grid-area: 1 / 1;
		align-items: center;
		justify-content: center;
		opacity: 0;
		translate: 0 1rem;
		visibility: hidden;
		transition:
			opacity 180ms ease,
			translate 0s 180ms,
			visibility 0s 180ms;
	}
	.left {
		translate: 0 -0.5rem;
		transition:
			opacity 180ms ease,
			translate 240ms var(--ui-ease-out),
			visibility 0s 240ms;
	}
	.on {
		opacity: 1;
		translate: 0 0;
		visibility: visible;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur-spring) var(--ui-ease-spring),
			visibility 0s;
	}
	.message {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.25rem 0.75rem;
		margin: 0;
		padding-block: 0.25rem;
		text-align: center;
	}
	.text {
		min-inline-size: 0;
	}
	.tag {
		padding: 0.0625rem 0.4375rem;
		border: 1px solid var(--edge);
		border-radius: 999px;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.01em;
	}
	.countdown {
		display: inline-flex;
		align-items: baseline;
		gap: 0.375rem;
		color: var(--muted);
		white-space: nowrap;
	}
	.time {
		display: inline-flex;
		align-items: baseline;
		color: var(--fg);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.unit,
	.sep {
		color: var(--muted);
		font-weight: 400;
	}
	.unit {
		margin-inline-start: 1px;
	}
	.sep {
		padding-inline: 1px;
	}
	.gap {
		display: inline-block;
		inline-size: 0.4em;
	}
	/* The action: a small button in the strip's contrasting color. */
	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.1875rem 0.5rem 0.1875rem 0.625rem;
		border: 0;
		border-radius: 999px;
		background: var(--fg);
		color: var(--on-fg);
		font: inherit;
		font-size: 0.75rem;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition: opacity var(--ui-dur-press) ease;
	}
	.cta :global(svg) {
		transition: translate var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) {
		.cta:hover {
			opacity: 0.88;
		}
		.cta:hover :global(svg) {
			translate: 2px 0;
		}
	}
	.cta:dir(rtl) :global(svg) {
		scale: -1 1;
	}

	/* One hairline per message across the bottom edge; the current one fills until the next. */
	.steps {
		position: absolute;
		inset: auto 0 0;
		display: flex;
		gap: 2px;
	}
	.step {
		flex: 1;
		block-size: 2px;
		overflow: hidden;
		background: color-mix(in srgb, var(--fg) 14%, transparent);
	}
	.past {
		background: color-mix(in srgb, var(--fg) 40%, transparent);
	}
	/* Linear: it is the time left, so it must move at a steady pace. */
	.run {
		display: block;
		block-size: 100%;
		background: color-mix(in srgb, var(--fg) 70%, transparent);
		transform-origin: left;
		animation-name: run;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}
	.run:dir(rtl) {
		transform-origin: right;
	}
	@keyframes run {
		from {
			transform: scaleX(0);
		}
	}

	.icon {
		position: relative;
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 2rem;
		block-size: 2rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--muted);
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur-press) ease,
			scale var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) {
		.icon:hover {
			background: color-mix(in srgb, currentColor 14%, transparent);
			color: var(--fg);
		}
	}
	.icon:active {
		scale: 0.94;
	}
	:is(.cta, .icon):focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 2px;
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	/* Phones: the message takes the room, controls at either end. */
	@media (width < 34rem) {
		.bar {
			grid-template-columns: auto minmax(0, 1fr) auto;
		}
	}
	@media (pointer: coarse) {
		.icon {
			inline-size: 2.75rem;
			block-size: 2.75rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.face,
		.left,
		.on {
			translate: 0 0;
		}
		.announcement {
			transition: opacity var(--ui-dur-exit) ease;
		}
	}
	@media (forced-colors: active) {
		.run {
			forced-color-adjust: none;
			background: Highlight;
		}
	}
</style>
