<script lang="ts">
	import WorldMap from '#lib/ui/WorldMap.svelte';

	// A rate, not a count: no share of the total, and values shown as percentages.
	const finished = [
		{ code: 'IQ', value: 0.62 },
		{ code: 'EG', value: 0.55 },
		{ code: 'ES', value: 0.71 },
		{ code: 'MA', value: 0.48 },
		{ code: 'IR', value: 0.66 },
		{ code: 'UZ', value: 0.39 }
	];
	const percent = new Intl.NumberFormat('en-US', { style: 'percent' }).format;
</script>

<WorldMap
	data={finished}
	title="Books read to the end, by country"
	valueLabel="Read to the end"
	format={percent}
	share={false}
/>
