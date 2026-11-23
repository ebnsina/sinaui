<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import Popover from '#lib/ui/Popover.svelte';
	import * as Radio from '#lib/ui/radio/index.js';
	import { accents, currentAccent, setAccent, type Accent } from './accent';

	import type { Side } from '#lib/ui/floating.js';

	let { size = 'sm', side = 'top' }: { size?: 'sm' | 'md'; side?: Side } = $props();

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

<Popover title="Accent color" hideTitle {side}>
	{#snippet trigger(props)}
		<Button {...props} variant="ghost" {size} square aria-label="Accent color">
			<span class="swatch" data-accent={accent}></span>
		</Button>
	{/snippet}
	<Radio.Group
		legend="Accent color"
		bind:value={() => accent, (v) => setAccent((accent = v as Accent))}
	>
		{#each accents as a (a.value)}
			<Radio.Item value={a.value}>
				<span class="option"><span class="swatch" data-accent={a.value}></span>{a.label}</span>
			</Radio.Item>
		{/each}
	</Radio.Group>
</Popover>

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
	.option {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
