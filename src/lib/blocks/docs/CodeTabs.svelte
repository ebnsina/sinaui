<script lang="ts" module>
	import type { Lang } from '#lib/ui/CodeBlock.svelte';

	export interface CodeSample {
		/** The tab's name ("curl", "JavaScript"); unique within the set. */
		label: string;
		code: string;
		lang?: Lang;
		/** Shown above the code; the tab's name when left out. */
		filename?: string;
	}
</script>

<script lang="ts">
	import CodeBlock from '#lib/ui/CodeBlock.svelte';
	import * as Tabs from '#lib/ui/tabs/index.js';

	interface Props {
		samples: CodeSample[];
		/**
		 * The tab shown (bindable). Bind every set on a page to one value so picking a language once
		 * switches them all.
		 */
		value?: string;
		/** Names the tab list. */
		label?: string;
		lineNumbers?: boolean;
	}

	let { samples, value = $bindable(), label = 'Language', lineNumbers = false }: Props = $props();

	// A remembered pick that this set doesn't have falls back to its first tab.
	const shown = $derived(samples.some((s) => s.label === value) ? value : samples[0]?.label);
</script>

{#if samples.length === 1}
	{@const s = samples[0]}
	<CodeBlock code={s.code} lang={s.lang} filename={s.filename} {lineNumbers} />
{:else if samples.length}
	<div class="code-tabs">
		<Tabs.Root size="sm" bind:value={() => shown, (v) => (value = v)}>
			<Tabs.List {label}>
				{#each samples as s (s.label)}<Tabs.Tab value={s.label}>{s.label}</Tabs.Tab>{/each}
			</Tabs.List>
			{#each samples as s (s.label)}
				<Tabs.Panel value={s.label}>
					<CodeBlock code={s.code} lang={s.lang} filename={s.filename ?? s.label} {lineNumbers} />
				</Tabs.Panel>
			{/each}
		</Tabs.Root>
	</div>
{/if}

<style>
	.code-tabs :global(.codeblock) {
		margin-block-start: 0.5rem;
	}
</style>
