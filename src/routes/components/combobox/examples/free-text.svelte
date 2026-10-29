<script lang="ts">
	import Combobox from '#lib/ui/Combobox.svelte';

	let field = $state('');
	const fields = ['Algebra', 'Astronomy', 'Geography', 'Medicine', 'Optics', 'Philosophy'].map(
		(label) => ({ value: label, label })
	);
</script>

<Combobox
	label="Field of study"
	placeholder="Pick one, or type your own"
	hint="Suggestions are a start: any field can be typed."
	options={fields}
	bind:value={field}
	allowsCustomValue
/>
<p>Value: {field || '—'}</p>
