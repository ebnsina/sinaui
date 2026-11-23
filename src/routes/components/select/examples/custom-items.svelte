<script lang="ts">
	import CustomSelect from '#lib/ui/CustomSelect.svelte';

	let ink = $state('lamp');
	const inks = [
		{ value: 'lamp', label: 'Lamp black', color: '#1b1b1d' },
		{ value: 'gall', label: 'Oak gall', color: '#3d3d42' },
		{ value: 'iron', label: 'Iron gray', color: '#6b6b70' },
		{ value: 'silver', label: 'Silverpoint', color: '#a8a8ae' }
	];
	const colorOf = (v: string) => inks.find((i) => i.value === v)?.color;
</script>

<CustomSelect label="Ink" options={inks} bind:value={ink}>
	{#snippet item(option)}
		<span class="row">
			<span class="swatch" style:background={colorOf(option.value)}></span>
			{option.label}
		</span>
	{/snippet}
</CustomSelect>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.swatch {
		inline-size: 0.875rem;
		block-size: 0.875rem;
		border-radius: var(--ui-radius-pill);
	}
</style>
