<script lang="ts">
	import WorldMap from '#lib/ui/WorldMap.svelte';

	const today = [
		{ code: 'IQ', value: 820 },
		{ code: 'EG', value: 610 },
		{ code: 'ES', value: 450 },
		{ code: 'MA', value: 300 },
		{ code: 'UZ', value: 120 }
	];
	// Who is reading right now; somewhere a new reader pops in every few seconds.
	const places = ['IQ', 'EG', 'ES', 'MA', 'UZ', 'IR', 'SY', 'TR'];
	let now = $state([
		{ code: 'IQ', value: 6 },
		{ code: 'EG', value: 3 }
	]);
	$effect(() => {
		const timer = setInterval(() => {
			const code = places[Math.floor(Math.random() * places.length)];
			const rest = now.filter((p) => p.code !== code).slice(-4);
			now = [...rest, { code, value: 1 + Math.floor(Math.random() * 6) }];
		}, 3000);
		return () => clearInterval(timer);
	});
</script>

<WorldMap data={today} pings={now} title="Readers today, and reading now" valueLabel="Readers" />
