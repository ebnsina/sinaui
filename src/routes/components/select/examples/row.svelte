<script lang="ts">
	import Input from '#lib/ui/Input.svelte';
	import Select from '#lib/ui/Select.svelte';
</script>

<div class="row">
	<Select label="Reading room" value="baghdad">
		<option value="baghdad">Bayt al-Hikma, Baghdad</option>
		<option value="fez">Al-Qarawiyyin, Fez</option>
	</Select>
	<Input label="Call number" value="MS 4192" hint="On the spine, under the title." />
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}
</style>
