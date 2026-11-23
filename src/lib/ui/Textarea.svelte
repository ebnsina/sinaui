<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTextareaAttributes, 'value' | 'children'> {
		label: string;
		/** Keeps the label for screen readers only. */
		hideLabel?: boolean;
		value?: string | null;
		hint?: string;
		error?: string;
	}

	const uid = $props.id();
	let {
		label,
		hideLabel = false,
		value = $bindable(),
		hint,
		error,
		rows = 3,
		id = uid,
		class: className,
		...rest
	}: Props = $props();

	const describedby = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);
</script>

<div class={['field', className]}>
	<label for={id} class:sr-only={hideLabel}>{label}</label>
	<textarea
		{id}
		{rows}
		style:--rows={rows}
		bind:value
		aria-invalid={error ? true : undefined}
		aria-describedby={describedby}
		{...rest}></textarea>
	{#if hint}<p id="{id}-hint" class="hint">{hint}</p>{/if}
	{#if error}<p id="{id}-error" class="error">{error}</p>{/if}
</div>

<style>
	.field {
		display: grid;
		/* Label stays tight when a neighbor is taller. */
		align-content: start;
		gap: 0.25rem;
		font: var(--ui-font-size)/1.5 var(--ui-font);
		color: var(--ui-fg);
	}
	label {
		font-weight: 500;
	}
	textarea {
		appearance: none;
		inline-size: 100%;
		margin: 0;
		/* One line is exactly a control's height, so a one-row box lines up with buttons and inputs;
		   taller boxes keep the same inset, so text starts where it does in an Input. */
		--h: var(--ui-control-h);
		--pad-y: calc((var(--h) - 2px - 1.5em) / 2);
		padding: var(--pad-y) 0.75rem;
		box-sizing: border-box;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		color: inherit;
		/* 16px minimum: iOS Safari zooms the page into any smaller field on focus. */
		font: inherit;
		font-size: var(--ui-control-font);
		line-height: 1.5;
		box-shadow: none;
		resize: vertical;
		/* Grows with its text where supported; elsewhere it's a normal resizable box starting at `rows`. */
		field-sizing: content;
		min-block-size: calc(var(--rows, 3) * 1.5em + 2 * var(--pad-y) + 2px);
		max-block-size: 20rem;
	}
	@media (pointer: coarse) {
		textarea {
			--h: var(--ui-control-h-touch);
		}
	}
	textarea::placeholder {
		color: var(--ui-muted);
		opacity: 1;
	}
	textarea:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	textarea[aria-invalid='true']:focus-visible {
		outline-color: var(--ui-danger);
	}
	textarea[aria-invalid='true'] {
		border-color: var(--ui-danger);
	}
	textarea:disabled {
		background: var(--ui-subtle);
		opacity: 0.55;
		cursor: not-allowed;
	}
	.hint,
	.error {
		margin: 0;
		font-size: 0.8125rem;
	}
	.hint {
		color: var(--ui-muted);
	}
	.error {
		color: var(--ui-danger);
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
