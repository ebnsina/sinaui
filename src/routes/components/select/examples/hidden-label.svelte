<script lang="ts">
	import Select from '#lib/ui/Select.svelte';

	let order = $state('newest');
</script>

<Select label="Sort by" hideLabel bind:value={order}>
	<option value="newest">Newest copies first</option>
	<option value="oldest">Oldest copies first</option>
	<option value="title">By title</option>
</Select>
