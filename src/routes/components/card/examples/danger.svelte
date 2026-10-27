<script lang="ts">
	import Card from '#lib/ui/Card.svelte';
	import ConfirmButton from '#lib/ui/ConfirmButton.svelte';
	import { toast } from '#lib/ui/toast/index.js';
</script>

<Card title="Danger zone" tone="danger">
	<div class="row">
		<div>
			<strong>Close the reading room</strong>
			<p>Its loans end today and its catalog is archived. You can reopen it within 30 days.</p>
		</div>
		<ConfirmButton size="sm" onconfirm={() => toast('Reading room closed.')} confirm="Close it?">
			Close room
		</ConfirmButton>
	</div>
	<div class="row">
		<div>
			<strong>Delete the library</strong>
			<p>Every room, member and loan record, for good. This can’t be undone.</p>
		</div>
		<ConfirmButton
			size="sm"
			onconfirm={() => toast('Library deleted.')}
			confirm="Delete everything?"
		>
			Delete library
		</ConfirmButton>
	</div>
</Card>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1.5rem;
	}
	.row + .row {
		padding-block-start: 0.75rem;
		border-block-start: 1px solid var(--ui-line);
	}
	p {
		margin: 0.125rem 0 0;
		color: var(--ui-muted);
	}
</style>
