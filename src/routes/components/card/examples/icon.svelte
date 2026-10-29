<script lang="ts">
	import { Notification01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
	import Card from '#lib/ui/Card.svelte';
</script>

<div class="stack">
	<Card title="Readers" description="Who can borrow from the House of Wisdom." icon={UserGroupIcon}>
		Scholars, translators and copyists, by invitation.
	</Card>
	<Card title="Reminders" description="When a book is due back." icon={Notification01Icon}>
		A note three days before, and again on the day.
	</Card>
</div>

<style>
	.stack {
		display: grid;
		gap: 1rem;
	}
</style>
