<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Chat from '#lib/blocks/chat/Chat.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import { demoConnection } from './demo-connection';

	let open = $state(false);
</script>

<Button variant="secondary" onclick={() => (open = true)}>Ask the librarian</Button>
<Dialog
	bind:open
	side="end"
	title="Librarian"
	description="Answers come from a short script in this demo."
	style="--ui-sheet-width: 28rem"
>
	<Chat
		connection={demoConnection}
		title="Ask the librarian"
		assistantName="Librarian"
		suggestions={['What was the House of Wisdom?', 'Where does the word algebra come from?']}
		fill
		bare
	/>
</Dialog>
