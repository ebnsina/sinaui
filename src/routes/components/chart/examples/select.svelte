<script lang="ts">
	import { barY, defineChart } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Chart from '#lib/ui/Chart.svelte';

	const returns = [
		{ day: 'Sat', books: 54 },
		{ day: 'Sun', books: 61 },
		{ day: 'Mon', books: 65 },
		{ day: 'Tue', books: 64 },
		{ day: 'Wed', books: 68 },
		{ day: 'Thu', books: 55 }
	];
	let chosen = $state<(typeof returns)[number] | null>(null);

	const definition = defineChart({
		marks: [barY(returns, { x: 'day', y: 'books', radius: 4 })],
		scales: {
			x: { scale: () => scaleBand<string>().padding(0.3), axis: { label: 'Day' } },
			y: {
				scale: scaleLinear,
				nice: true,
				grid: true,
				axis: { label: 'Books returned', ticks: { count: 4 } }
			}
		},
		// A click chooses the day instead of pinning its tooltip.
		tooltip: { use: tooltip, sticky: false }
	});
</script>

<div class="stack">
	<Chart
		title="Returns by day"
		description="Choose a day to see its returns."
		{definition}
		onselect={(p) => (chosen = (p?.datum as (typeof returns)[number] | undefined) ?? null)}
	/>
	<p role="status">
		{chosen ? `${chosen.day}: ${chosen.books} books returned.` : 'No day chosen.'}
	</p>
</div>

<style>
	.stack {
		display: grid;
		gap: 0.75rem;
	}
	p {
		margin: 0;
		color: var(--ui-muted);
	}
</style>
