<script lang="ts">
	import { AlertCircleIcon, Tick02Icon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';

	interface Props {
		/** error: something to fix on that step, shown in place of its description. */
		steps: { label: string; description?: string; error?: string }[];
		/** Index of the step in progress; steps before it are done. */
		current?: number;
		/** Called when a finished step is chosen, to go back to it. Without it, steps can't be chosen. */
		onstep?: (index: number) => void;
		label?: string;
		/** vertical: markers down the side with names beside them, for sidebars and narrow columns. */
		orientation?: 'horizontal' | 'vertical';
	}

	let {
		steps,
		current = $bindable(0),
		onstep,
		label = 'Progress',
		orientation = 'horizontal'
	}: Props = $props();

	const last = $derived(steps.length - 1);
</script>

<nav aria-label={label} class={['stepper', orientation]}>
	<!-- Narrow screens show only the current step's name; this says where it is in the list. -->
	<p class="count" aria-hidden="true">
		Step {Math.min(current, last) + 1} of {steps.length}: {steps[Math.min(current, last)]?.label}
	</p>
	<div class="rail" style:--n={steps.length}>
		<ol>
			{#each steps as step, i (i)}
				{@const state = i < current ? 'done' : i === current ? 'current' : 'next'}
				<li
					class={[state, step.error && 'error']}
					aria-current={state === 'current' ? 'step' : undefined}
				>
					<!-- The line on to the next marker, filled once this step is done. -->
					{#if i < last}<span class="link" aria-hidden="true"></span>{/if}
					{#if state === 'done' && onstep}
						<button type="button" class="step" onclick={() => onstep(i)}>
							{@render inner(step, i, state)}
						</button>
					{:else}
						<span class="step">{@render inner(step, i, state)}</span>
					{/if}
				</li>
			{/each}
		</ol>
	</div>
</nav>

{#snippet inner(step: Props['steps'][number], i: number, state: string)}
	<span class="marker" aria-hidden="true">
		{#if step.error}
			<span class="tick"><Icon icon={AlertCircleIcon} size={16} strokeWidth={2} /></span>
		{:else if state === 'done'}
			<span class="tick"><Icon icon={Tick02Icon} size={14} strokeWidth={2.5} /></span>
		{:else}
			{i + 1}
		{/if}
	</span>
	<span class="text">
		<!-- One hidden phrase for screen readers (split across elements, its spaces get lost), and the
		     visible label hidden from them. -->
		<span class="sr-only"
			>Step {i + 1} of {steps.length}: {step.label}{state === 'done'
				? ', completed'
				: state === 'current'
					? ', current'
					: ''}{step.error ? `, needs attention: ${step.error}` : ''}</span
		>
		<span class="name" aria-hidden="true">{step.label}</span>
		{#if step.error}<span class="description problem" aria-hidden="true">{step.error}</span>
		{:else if step.description}<span class="description">{step.description}</span>{/if}
	</span>
{/snippet}

<style>
	.stepper {
		container-type: inline-size;
		color: var(--ui-fg);
		font: 0.875rem/1.4 var(--ui-font);
	}
	.count {
		display: none;
		margin: 0 0 0.5rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	/* Horizontal: equal columns, a marker centered in each, its name below, lines between. */
	.rail {
		position: relative;
	}
	ol {
		display: grid;
		grid-template-columns: repeat(var(--n), minmax(0, 1fr));
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		position: relative;
		display: flex;
		justify-content: center;
		min-inline-size: 0;
	}
	.step {
		display: grid;
		justify-items: center;
		gap: 0.5rem;
		max-inline-size: 100%;
		margin: 0;
		padding: 0 0.25rem;
		border: 0;
		border-radius: var(--ui-radius);
		background: none;
		color: inherit;
		font: inherit;
		text-align: center;
	}
	button.step {
		cursor: pointer;
	}
	button.step:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	/* A rounded square: faint ahead, solid ink for the step you're on, a light tint with a tick once done. */
	.marker {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		box-sizing: border-box;
		inline-size: 2rem;
		block-size: 2rem;
		border: 1px solid var(--ui-field-line);
		border-radius: 0.75rem;
		background: var(--ui-surface);
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		/* Fill and number switch at once; fading both leaves the number unreadable mid-way. */
		transition: transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.current .marker {
		border-color: var(--ui-accent);
		background: var(--ui-accent);
		color: var(--ui-on-accent);
	}
	.done .marker {
		border-color: transparent;
		background: var(--ui-hover);
		color: var(--ui-fg);
	}
	.error .marker,
	.error.done .marker {
		border-color: var(--ui-danger);
		background: var(--ui-surface);
		color: var(--ui-danger);
		box-shadow: none;
	}
	@media (hover: hover) and (pointer: fine) {
		button.step:hover .marker {
			transform: scale(1.06);
		}
	}
	button.step:active .marker {
		transform: scale(0.94);
	}
	/* The tick pops in as a step is finished. */
	.tick {
		display: grid;
		transition:
			scale var(--ui-dur-overlay) var(--ui-ease-out),
			opacity var(--ui-dur-overlay) ease;
	}
	@starting-style {
		.tick {
			scale: 0.4;
			opacity: 0;
		}
	}
	/* From just past this marker to just before the next; fills once this step is done. */
	.link {
		position: absolute;
		inset-block-start: calc(1rem - 1px);
		inset-inline: calc(50% + 1.5rem) calc(-50% + 1.5rem);
		block-size: 2px;
		overflow: hidden;
		border-radius: 1px;
		background: var(--ui-line);
	}
	.link::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--ui-accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 450ms var(--ui-ease-out);
	}
	.link:dir(rtl)::after {
		transform-origin: right;
	}
	.done .link::after {
		transform: none;
	}
	.text {
		display: grid;
		min-inline-size: 0;
	}
	.name {
		overflow: hidden;
		color: var(--ui-muted);
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: color var(--ui-dur-overlay) ease;
	}
	.current .name,
	.done .name {
		color: var(--ui-fg);
	}
	.description {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.problem {
		color: var(--ui-danger);
	}

	/* Vertical: one step per row, marker on the start side with its name beside it. */
	.vertical .count {
		display: none;
	}
	.vertical ol {
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
	}
	.vertical li {
		position: relative;
		justify-content: flex-start;
	}
	.vertical .step {
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		justify-items: start;
		column-gap: 0.75rem;
		padding: 0;
		text-align: start;
	}
	.vertical .text {
		padding-block-start: 0.3125rem;
	}
	.vertical .name {
		white-space: normal;
	}
	/* Vertical: the link runs down from under this marker to the next one, and fills downwards. */
	.vertical .link {
		inset-block: calc(2rem + 0.25rem) calc(-1.25rem + 0.25rem);
		inset-inline: calc(1rem - 1px) auto;
		inline-size: 2px;
		block-size: auto;
	}
	.vertical .link::after {
		transform: scaleY(0);
		transform-origin: top;
	}
	.vertical .done .link::after {
		transform: none;
	}
	/* Narrow: markers only, with the current step named in the count above (horizontal only). */
	@container (max-width: 34rem) {
		.horizontal .count {
			display: block;
		}
		/* Hidden from sight only: the step's name must still reach screen readers. */
		.horizontal .text {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.link::after,
		.tick {
			transition: none;
		}
	}
	@media (forced-colors: active) {
		:is(.current, .done) .marker {
			outline: 2px solid Highlight;
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
</style>
