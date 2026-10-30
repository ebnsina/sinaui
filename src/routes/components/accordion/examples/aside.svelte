<script lang="ts">
	import * as Accordion from '#lib/ui/accordion/index.js';
	import Switch from '#lib/ui/Switch.svelte';

	let groups = $state([
		{ name: 'SQL injection', rules: 8, on: true },
		{ name: 'Cross-site scripting', rules: 6, on: true },
		{ name: 'Path traversal', rules: 3, on: false }
	]);
</script>

<!-- The switch sits outside <summary>, so it toggles the group, not the section. -->
<Accordion.Root>
	{#each groups as g (g.name)}
		<Accordion.Item title={g.name} description="{g.rules} rules · {g.on ? 'on' : 'off'}">
			{#snippet aside()}<Switch bind:checked={g.on} aria-label="{g.name}: all rules" />{/snippet}
			The {g.rules} rules in this group.
		</Accordion.Item>
	{/each}
</Accordion.Root>
