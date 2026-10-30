<script lang="ts">
	import { BookOpen01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

<Button variant="secondary" onclick={() => (open = true)}>Open the loan</Button>
<Dialog
	bind:open
	side="end"
	title="Loan returned"
	description="The Canon of Medicine, back on its shelf."
>
	{#snippet icon()}
		<span class="status"><Icon icon={BookOpen01Icon} size={18} /></span>
	{/snippet}
	<p>Returned to the House of Wisdom two days early.</p>
</Dialog>

<style>
	.status {
		display: grid;
		place-items: center;
		inline-size: 2.25rem;
		block-size: 2.25rem;
		border-radius: 50%;
		background: var(--ui-hover);
		color: var(--ui-fg);
	}
	p {
		margin: 0;
	}
</style>
