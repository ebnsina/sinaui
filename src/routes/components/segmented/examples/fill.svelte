<script lang="ts">
	import Segmented from '#lib/ui/Segmented.svelte';

	let view = $state('list');
</script>

<!-- fill spans the container; turn it on only on phones with fill={narrow}, say. -->
<Segmented
	label="Show the catalog as"
	fill
	options={[
		{ value: 'list', label: 'List' },
		{ value: 'grid', label: 'Grid' },
		{ value: 'map', label: 'Map' }
	]}
	bind:value={view}
/>
