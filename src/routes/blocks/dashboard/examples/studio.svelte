<script lang="ts">
	import {
		AudioWave01Icon,
		CodeIcon,
		Folder01Icon,
		Home01Icon,
		LanguageSkillIcon,
		Mic01Icon,
		Search01Icon,
		TextIcon,
		UserGroupIcon
	} from '@hugeicons/core-free-icons';
	import { defineChart, lineY } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { tooltip } from '@tanstack/charts/tooltip';
	import AccountMenu from '#lib/ui/AccountMenu.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Chart from '#lib/ui/Chart.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Kbd from '#lib/ui/Kbd.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import SidebarLayout, { type SidebarGroup } from '#lib/ui/SidebarLayout.svelte';
	import StatTabs from '#lib/ui/StatTabs.svelte';
	import Table from '#lib/ui/Table.svelte';
	import * as Tabs from '#lib/ui/tabs/index.js';
	import { toast } from '#lib/ui/toast/index.js';

	// inset: the page sits on its own panel, the sidebar on the window tint.
	let { inset = false, name = 'Bayt al-Ḥikma' }: { inset?: boolean; name?: string } = $props();

	const groups: SidebarGroup[] = [
		{
			items: [
				{ label: 'Home', href: '#st-home', icon: Home01Icon },
				{ label: 'Voices', href: '#st-voices', icon: UserGroupIcon },
				{ label: 'Library', href: '#st-library', icon: Folder01Icon }
			]
		},
		{
			title: 'Pinned',
			items: [
				{ label: 'Narration', href: '#st-narration', icon: AudioWave01Icon },
				{ label: 'Translation', href: '#st-translation', icon: LanguageSkillIcon },
				{ label: 'Transcription', href: '#st-transcription', icon: TextIcon },
				{ label: 'Recording', href: '#st-recording', icon: Mic01Icon }
			]
		},
		{ items: [{ label: 'Developers', href: '#st-developers', icon: CodeIcon }] }
	];

	const ranges = [
		{ value: '7d', label: '7 days' },
		{ value: '30d', label: '30 days' }
	];
	let range = $state('7d');
	let section = $state('usage');
	let metric = $state('characters');

	// Seeded, so the server and the browser draw the same numbers.
	const wave = (n: number, base: number, swing: number, seed: number) =>
		Array.from({ length: n }, (_, i) =>
			Math.round(base + swing * Math.sin(i * 0.9 + seed) + i * swing * 0.04)
		);
	const days = (n: number) =>
		Array.from({ length: n }, (_, i) =>
			new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
				new Date(Date.UTC(2026, 9, 27 - n + 1 + i))
			)
		);
	const data = $derived.by(() => {
		const n = range === '7d' ? 7 : 30;
		return {
			labels: days(n),
			characters: wave(n, 48_000, 9_000, 1),
			minutes: wave(n, 52, 11, 2),
			requests: wave(n, 1_240, 260, 3)
		};
	});

	const count = new Intl.NumberFormat('en-US');
	const usd = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 3
	});
	const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
	const series = $derived({
		characters: {
			label: 'Characters',
			points: data.characters,
			display: count.format(sum(data.characters))
		},
		minutes: {
			label: 'Audio minutes',
			points: data.minutes,
			display: count.format(sum(data.minutes))
		},
		requests: {
			label: 'Requests',
			points: data.requests,
			display: count.format(sum(data.requests))
		},
		cost: {
			label: 'Cost per request',
			points: data.requests.map((r, i) => +((data.characters[i] * 0.00003) / r).toFixed(4)),
			display: usd.format((sum(data.characters) * 0.00003) / sum(data.requests))
		}
	});
	const items = $derived(Object.entries(series).map(([value, s]) => ({ value, ...s })));
	const chosen = $derived(series[metric as keyof typeof series]);
	const chart = $derived(
		defineChart({
			marks: [
				lineY(
					chosen.points.map((v, i) => ({ day: data.labels[i], v })),
					{ x: 'day', y: 'v', strokeWidth: 2 }
				)
			],
			scales: {
				x: { scale: () => scalePoint<string>().padding(0.2), axis: { ticks: { count: 7 } } },
				y: { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { count: 4 } } }
			},
			tooltip
		})
	);

	const models = $derived(
		[
			{ name: 'Narration, expressive', share: 0.46 },
			{ name: 'Narration, fast', share: 0.31 },
			{ name: 'Translation', share: 0.15 },
			{ name: 'Transcription', share: 0.08 }
		].map((m) => ({
			...m,
			characters: Math.round(sum(data.characters) * m.share),
			requests: Math.round(sum(data.requests) * m.share)
		}))
	);
	const percent = new Intl.NumberFormat('en-US', { style: 'percent' });

	let current = $state('#st-developers');
</script>

<div class="frame">
	<SidebarLayout
		label={name}
		{inset}
		{groups}
		{current}
		crumbs={[{ label: 'Developers', href: '#st-developers' }, { label: 'Usage' }]}
		onselect={(item) => (current = item.href)}
	>
		{#snippet header(collapsed)}
			<span class="brand">
				<span class="mark" aria-hidden="true">{name[0]}</span>
				{#if !collapsed}<strong>{name}</strong>{/if}
			</span>
		{/snippet}
		{#snippet topbar()}
			<div class="actions">
				<Button variant="outline" onclick={() => toast('Search would open here.')}>
					<Icon icon={Search01Icon} size={16} /> <span class="st-search-label">Search</span>
					<Kbd keys={['mod', 'K']} />
				</Button>
				<AccountMenu
					user={{ name: 'Hunayn ibn Ishaq', email: 'hunayn@hikma.example' }}
					onsignout={() => toast('Signed out.')}
				/>
			</div>
		{/snippet}

		<div class="page">
			<div class="head">
				<h4>Developers</h4>
				<Button variant="outline" size="sm" onclick={() => toast('The price list would open here.')}
					>Pricing</Button
				>
			</div>

			<Tabs.Root bind:value={section}>
				<Tabs.List label="Developer sections">
					<Tabs.Tab value="overview">Overview</Tabs.Tab>
					<Tabs.Tab value="keys">Keys</Tabs.Tab>
					<Tabs.Tab value="usage">Usage</Tabs.Tab>
					<Tabs.Tab value="log">Request log</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="overview"
					><p class="note">Your keys, limits and recent errors.</p></Tabs.Panel
				>
				<Tabs.Panel value="keys"><p class="note">Create and revoke access keys here.</p></Tabs.Panel
				>
				<Tabs.Panel value="log"><p class="note">Every request, newest first.</p></Tabs.Panel>
				<Tabs.Panel value="usage">
					<div class="usage">
						<div class="filters">
							<Segmented label="Period" hideLabel options={ranges} bind:value={range} />
						</div>

						<Card flush>
							<StatTabs label="Chart metric" {items} bind:value={metric} />
							<div class="chart">
								<Chart
									title="{chosen.label}, last {range === '7d' ? '7' : '30'} days"
									description="One point per day."
									definition={chart}
									aspectRatio={3}
								/>
							</div>
						</Card>

						<Table caption="{name}: usage by model">
							<thead>
								<tr
									><th>Model</th><th class="num">Characters</th><th class="num">Requests</th><th
										class="num">Share</th
									></tr
								>
							</thead>
							<tbody>
								{#each models as m (m.name)}
									<tr>
										<td>{m.name}</td>
										<td class="num">{count.format(m.characters)}</td>
										<td class="num">{count.format(m.requests)}</td>
										<td class="num">{percent.format(m.share)}</td>
									</tr>
								{/each}
							</tbody>
						</Table>
					</div>
				</Tabs.Panel>
			</Tabs.Root>
		</div>
	</SidebarLayout>
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 44rem;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) + 0.25rem);
		background: var(--ui-surface);
		border: 1px solid var(--ui-field-line);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.mark {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 1.75rem;
		block-size: 1.75rem;
		border-radius: calc(var(--ui-radius) * 0.75);
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		font-weight: 600;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.page {
		display: grid;
		gap: 1rem;
		padding: 1.25rem 1.5rem 2rem;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	h4 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	.filters {
		display: flex;
	}
	.usage {
		display: grid;
		gap: 1rem;
		padding-block-start: 1rem;
	}
	.chart {
		padding: 1rem;
	}
	.note {
		margin: 0;
		padding-block-start: 1rem;
		color: var(--ui-muted);
	}
	@media (width < 40rem) {
		.page {
			padding-inline: 1rem;
		}
		:global(.st-search-label) {
			display: none;
		}
	}
</style>
