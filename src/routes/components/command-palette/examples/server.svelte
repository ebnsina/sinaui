<script lang="ts">
	import { BookOpen01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import CommandPalette, { type Command } from '#lib/ui/CommandPalette.svelte';

	const catalog = [
		'Book of Optics',
		'Canon of Medicine',
		'Book of Healing',
		'Book of Roads and Kingdoms'
	];

	let open = $state(false);
	let query = $state('');
	let found = $state<Command[]>([]);
	let last = $state<string>();

	// A stand-in for your API: it answers after a pause, and a newer query replaces the one in flight.
	$effect(() => {
		const q = query.trim().toLowerCase();
		if (!q) return void (found = []);
		const timer = setTimeout(() => {
			found = catalog
				.filter((title) => title.toLowerCase().includes(q))
				.map((title) => ({
					id: title,
					label: title,
					group: 'Manuscripts',
					icon: BookOpen01Icon,
					onselect: () => (last = title)
				}));
		}, 300);
		return () => clearTimeout(timer);
	});
</script>

<Button variant="secondary" onclick={() => (open = true)}>Search the library</Button>
{#if last}<p>Opened: {last}</p>{/if}
<CommandPalette
	bind:open
	bind:query
	commands={[]}
	search={() => found}
	shortcut={false}
	label="Search the library"
	placeholder="Search manuscripts…"
	empty="No manuscripts match"
/>
