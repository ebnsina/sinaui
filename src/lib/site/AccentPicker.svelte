<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';
	import { accents, currentAccent, setAccent, type Accent } from './accent';

	let { size = 'sm' }: { size?: 'sm' | 'md' } = $props();

	let accent = $state<Accent>('mono');
	onMount(() => {
		const sync = () => (accent = currentAccent());
		sync();
		// Another picker on the page (header and sidebar) keeps this one in step.
		const observer = new MutationObserver(sync);
		observer.observe(document.documentElement, { attributeFilter: ['data-accent'] });
		return () => observer.disconnect();
	});
</script>

<Dropdown.Root>
	{#snippet trigger(props)}
		<Button {...props} variant="ghost" {size} square aria-label="Accent color">
			<span class="swatch" data-accent={accent}></span>
		</Button>
	{/snippet}
	{#each accents as a (a.value)}
		<Dropdown.Item checked={accent === a.value} onselect={() => setAccent((accent = a.value))}>
			<span class="swatch" data-accent={a.value}></span>{a.label}
		</Dropdown.Item>
	{/each}
</Dropdown.Root>

<style>
	/* Each swatch carries its own data-accent, so it shows that preset's color straight from tokens.css. */
	.swatch {
		display: inline-block;
		flex: none;
		inline-size: 0.875rem;
		block-size: 0.875rem;
		border-radius: var(--ui-radius-pill);
		background: var(--ui-accent);
	}
</style>
