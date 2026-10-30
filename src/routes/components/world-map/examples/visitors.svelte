<script lang="ts">
	import WorldMap from '#lib/ui/WorldMap.svelte';

	const readers = [
		{ code: 'IQ', value: 4210 },
		{ code: 'EG', value: 3105 },
		{ code: 'ES', value: 2380 },
		{ code: 'IR', value: 1940 },
		{ code: 'MA', value: 1210 },
		{ code: 'SY', value: 980 },
		{ code: 'UZ', value: 760 },
		{ code: 'TR', value: 690 },
		{ code: 'TN', value: 410 },
		{ code: 'IN', value: 380 },
		{ code: 'SA', value: 240 },
		{ code: 'BH', value: 64 },
		{ code: 'SG', value: 41 }
	];
	let picked = $state<string | null>(null);
	const names = new Intl.DisplayNames(['en-US'], { type: 'region' });
</script>

<WorldMap
	data={readers}
	title="Library readers by country"
	description="Readers of the House of Wisdom catalog in the last 30 days."
	valueLabel="Readers"
	selected={picked}
	onselect={(code) => (picked = picked === code ? null : code)}
/>
<p class="note">
	{picked ? `Showing readers from ${names.of(picked)}.` : 'Pick a country to filter by it.'}
</p>

<style>
	.note {
		margin: 0.75rem 0 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
