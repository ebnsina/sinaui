<script lang="ts">
	import Sparkline from '#lib/ui/Sparkline.svelte';

	const rooms = [
		{ name: 'Baghdad', visits: [42, 48, 45, 60, 58, 71, 76] },
		{ name: 'Córdoba', visits: [30, 28, 33, 31, 29, 34, 36] },
		{ name: 'Fez', visits: [18, 22, 16, 14, 12, 11, 9] }
	];
	const count = new Intl.NumberFormat('en-US');
</script>

<ul class="rooms">
	{#each rooms as r (r.name)}
		<li>
			<span class="name">{r.name}</span>
			<span class="num">{count.format(r.visits.reduce((a, b) => a + b, 0))}</span>
			<Sparkline values={r.visits} label="{r.name} reading-room visits, last 7 days" />
		</li>
	{/each}
</ul>

<style>
	.rooms {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		gap: 0.25rem;
	}
	.name {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.num {
		font-size: 1.25rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
</style>
