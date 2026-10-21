<script lang="ts">
	import Chat from '#lib/blocks/chat/Chat.svelte';
	import { fetchServerSentEvents } from '@tanstack/ai-svelte';

	// Stands in for your server turning a question away: a 429 with a message written for people.
	const demoFetch = async () =>
		Response.json(
			{ message: 'You’ve asked all 20 questions in this month’s plan.' },
			{ status: 429 }
		);

	let failure = $state<{ message: string }>();
	const connection = fetchServerSentEvents('/api/chat', {
		// In your app: fetch(input, init).
		fetchClient: async () => {
			const res = await demoFetch();
			failure = res.ok
				? undefined
				: await res
						.clone()
						.json()
						.catch(() => undefined);
			return res;
		}
	});
</script>

<Chat
	{connection}
	title="Ask the reading room"
	assistantName="Librarian"
	suggestions={['What was the House of Wisdom?']}
	{failure}
>
	{#snippet failureActions()}<a href="#pricing">See plans</a>{/snippet}
</Chat>
