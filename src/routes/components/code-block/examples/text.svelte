<script lang="ts">
	import CodeBlock from '#lib/ui/CodeBlock.svelte';

	const prompt = `Deploy the app <web> and tell me when it's live.
If it fails, read the log & explain why in plain words.`;
</script>

<CodeBlock code={prompt} lang="text" filename="Prompt" lineNumbers={false} class="demo" />

<style>
	:global(.demo) {
		inline-size: min(40rem, 100%);
	}
</style>
