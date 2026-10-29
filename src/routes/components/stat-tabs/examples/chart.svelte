<script lang="ts">
	import { defineChart, lineY } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Card from '#lib/ui/Card.svelte';
	import Chart from '#lib/ui/Chart.svelte';
	import StatTabs from '#lib/ui/StatTabs.svelte';

	const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
	const series: Record<string, { label: string; points: number[] }> = {
		loans: { label: 'Loans', points: [412, 380, 455, 498, 471, 520, 506] },
		visits: { label: 'Visits', points: [1820, 1610, 1905, 2040, 1987, 2112, 2230] },
		members: { label: 'New members', points: [31, 28, 40, 36, 44, 39, 47] },
		overdue: { label: 'Overdue', points: [16, 15, 14, 14, 12, 13, 11] }
	};
	const count = new Intl.NumberFormat('en-US');
	const pct = new Intl.NumberFormat('en-US', { style: 'percent', signDisplay: 'exceptZero' });
	const items = Object.entries(series).map(([value, s]) => {
		const moved = s.points[6] / s.points[0] - 1;
		return {
			value,
			label: s.label,
			display: count.format(s.points.reduce((a, b) => a + b, 0)),
			change: `${pct.format(moved)} since Saturday`,
			trend: moved > 0 ? 'up' : moved < 0 ? 'down' : 'flat'
		} as const;
	});

	let metric = $state('loans');
	const chosen = $derived(series[metric]);
	const chart = $derived(
		defineChart({
			marks: [
				lineY(
					chosen.points.map((v, i) => ({ day: days[i], v })),
					{ x: 'day', y: 'v', strokeWidth: 2 }
				)
			],
			scales: {
				x: { scale: () => scalePoint<string>().padding(0.2) },
				y: { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { count: 4 } } }
			},
			tooltip
		})
	);
</script>

<Card flush class="stats-card">
	<StatTabs label="Chart metric" {items} bind:value={metric} />
	<div class="chart">
		<Chart
			title="{chosen.label} this week"
			description="One point per day."
			definition={chart}
			aspectRatio={2.6}
		/>
	</div>
</Card>

<style>
	:global(.stats-card) {
		inline-size: 100%;
	}
	.chart {
		padding: 1rem;
	}
</style>
