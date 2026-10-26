<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Input from '#lib/ui/Input.svelte';
	import Select from '#lib/ui/Select.svelte';
</script>

<div class="row">
	<Input label="Title" hideLabel placeholder="Kitab al-Manazir" />
	<Select label="Shelf" hideLabel value="optics">
		<option value="optics">Optics</option>
		<option value="algebra">Algebra</option>
	</Select>
	<Button>Borrow</Button>
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		align-items: end;
		gap: 0.5rem;
	}
</style>
