<script lang="ts">
	import Sortable from '#lib/ui/Sortable.svelte';

	// Whole tiles drag: on a phone, press and hold a tile, then move it.
	let folios = $state(
		['1r', '1v', '2r', '2v', '3r', '3v'].map((name, i) => ({ name, shade: 0.95 - i * 0.025 }))
	);
</script>

<Sortable
	bind:items={folios}
	key={(f) => f.name}
	itemLabel={(f) => `Folio ${f.name}`}
	label="Folios"
	layout="grid"
	class="folios"
>
	{#snippet children(folio, handle, { dragging })}
		<button
			type="button"
			class={['tile', dragging && 'dragging']}
			style:--shade={folio.shade}
			data-sortable-item
			{...handle}
		>
			<span>Folio {folio.name}</span>
		</button>
	{/snippet}
</Sortable>

<style>
	:global(.folios) {
		--sortable-columns: 3;
		inline-size: min(26rem, 100%);
	}
	.tile {
		display: grid;
		align-items: end;
		inline-size: 100%;
		aspect-ratio: 3 / 4;
		padding: 0.625rem;
		border: 0;
		border-radius: var(--ui-radius);
		/* Each folio a step darker, so the order is easy to follow. */
		background: linear-gradient(
			160deg,
			oklch(var(--shade) 0 0),
			oklch(calc(var(--shade) - 0.1) 0 0)
		);
		color: oklch(0.3 0 0);
		font: 600 0.8125rem/1 var(--ui-font);
		text-align: start;
		user-select: none;
		-webkit-user-select: none;
	}
	.tile:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
</style>
