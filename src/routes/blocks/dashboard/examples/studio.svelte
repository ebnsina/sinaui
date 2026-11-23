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
	import Badge from '#lib/ui/Badge.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Chart from '#lib/ui/Chart.svelte';
	import CommandPalette from '#lib/ui/CommandPalette.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Kbd from '#lib/ui/Kbd.svelte';
	import Meter from '#lib/ui/Meter.svelte';
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

	// Search: every page in the sidebar, plus the developer sections.
	let searching = $state(false);
	const commands = [
		...groups.flatMap((g) =>
			g.items.map((i) => ({
				id: i.href,
				label: i.label,
				group: g.title ?? 'Pages',
				icon: i.icon,
				onselect: () => (current = i.href)
			}))
		),
		...[
			['overview', 'Overview'],
			['keys', 'Keys'],
			['usage', 'Usage'],
			['log', 'Request log']
		].map(([value, label]) => ({
			id: `section:${value}`,
			label: `Developers: ${label}`,
			group: 'Developers',
			onselect: () => {
				current = '#st-developers';
				section = value;
			}
		}))
	];

	const limits = [
		{ label: 'Characters this month', used: 1_420_000, max: 2_000_000 },
		{ label: 'Audio minutes', used: 1_610, max: 2_000 },
		{ label: 'Voice clones', used: 3, max: 10 }
	];
	const errors = [
		{ when: '2:41 PM', code: 429, text: 'Too many requests from the reading-room kiosk' },
		{ when: '11:08 AM', code: 400, text: 'Text longer than 5,000 characters' },
		{ when: 'Yesterday', code: 401, text: 'A revoked key was used by the archive script' }
	];
	const keys = [
		{
			name: 'Website',
			key: 'sk_live_…4f2a',
			scope: 'Narration',
			created: 'Mar 2',
			used: '2 min ago'
		},
		{
			name: 'Archive script',
			key: 'sk_live_…9c07',
			scope: 'All',
			created: 'Jan 18',
			used: 'Yesterday'
		},
		{
			name: 'Kiosk, main hall',
			key: 'sk_live_…13be',
			scope: 'Translation',
			created: 'Sep 9',
			used: '1 h ago'
		},
		{ name: 'Testing', key: 'sk_test_…77d1', scope: 'All', created: 'Oct 20', used: 'Never' }
	];
	const log = [
		{ time: '14:42:07', method: 'POST', path: '/v1/narrate', status: 200, ms: 812 },
		{ time: '14:41:55', method: 'POST', path: '/v1/translate', status: 200, ms: 344 },
		{ time: '14:41:12', method: 'POST', path: '/v1/narrate', status: 429, ms: 12 },
		{ time: '14:40:48', method: 'GET', path: '/v1/voices', status: 200, ms: 41 },
		{ time: '14:39:30', method: 'POST', path: '/v1/transcribe', status: 200, ms: 2_190 },
		{ time: '14:38:02', method: 'POST', path: '/v1/narrate', status: 400, ms: 9 },
		{ time: '14:37:44', method: 'GET', path: '/v1/usage', status: 200, ms: 63 },
		{ time: '14:36:19', method: 'POST', path: '/v1/translate', status: 200, ms: 402 }
	];
	const toneOfStatus = (code: number) =>
		code < 300 ? 'accent' : code === 429 ? 'warning' : 'danger';
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
				<Button
					variant="outline"
					aria-label="Search"
					aria-haspopup="dialog"
					onclick={() => (searching = true)}
				>
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
				<Tabs.Panel value="overview">
					<div class="usage">
						<div class="tiles">
							<Card title="Requests today" description="Up 8% on yesterday.">
								<strong class="big">1,284</strong>
							</Card>
							<Card title="Errors" description="3 in the last 24 hours.">
								<strong class="big">0.2%</strong>
							</Card>
							<Card title="Slowest 5%" description="Of requests took longer than this.">
								<strong class="big">1.9 s</strong>
							</Card>
						</div>
						<div class="split">
							<Card title="This month's limits" description="The plan renews on Nov 1.">
								<div class="meters">
									{#each limits as l (l.label)}
										<Meter
											label={l.label}
											value={l.used}
											max={l.max}
											high={l.max * 0.8}
											optimum={0}
											format={(v, _, max) => `${count.format(v)} of ${count.format(max)}`}
										/>
									{/each}
								</div>
							</Card>
							<Card title="Recent errors" description="What failed, and why.">
								<ul class="errors">
									{#each errors as e (e.when + e.code)}
										<li>
											<Badge tone={toneOfStatus(e.code)}>{e.code}</Badge>
											<span>{e.text}<span class="when">{e.when}</span></span>
										</li>
									{/each}
								</ul>
							</Card>
						</div>
					</div>
				</Tabs.Panel>
				<Tabs.Panel value="keys">
					<div class="usage">
						<div class="bar-row">
							<p class="lead">Keys let your apps call the studio. Keep them out of public code.</p>
							<Button onclick={() => toast('A new key would be made and shown once.')}
								>Create key</Button
							>
						</div>
						<Card flush>
							<Table caption="Access keys" hideCaption>
								<thead>
									<tr
										><th>Name</th><th>Key</th><th>Can use</th><th class="opt">Created</th><th
											>Last used</th
										><th><span class="sr">Actions</span></th></tr
									>
								</thead>
								<tbody>
									{#each keys as k (k.key)}
										<tr>
											<td>{k.name}</td>
											<td class="mono">{k.key}</td>
											<td><Badge tone="neutral" icon={false}>{k.scope}</Badge></td>
											<td class="opt">{k.created}</td>
											<td class="muted">{k.used}</td>
											<td class="end"
												><Button
													variant="ghost"
													size="sm"
													onclick={() => toast(`${k.name}: the key would be revoked.`)}
													>Revoke</Button
												></td
											>
										</tr>
									{/each}
								</tbody>
							</Table>
						</Card>
					</div>
				</Tabs.Panel>
				<Tabs.Panel value="log">
					<div class="usage">
						<p class="lead">Every request in the last hour, newest first.</p>
						<Card flush>
							<Table caption="Request log" hideCaption>
								<thead>
									<tr><th>Time</th><th>Request</th><th>Status</th><th class="num">Took</th></tr>
								</thead>
								<tbody>
									{#each log as l (l.time)}
										<tr>
											<td class="mono">{l.time}</td>
											<td class="mono"><span class="muted">{l.method}</span> {l.path}</td>
											<td><Badge tone={toneOfStatus(l.status)}>{l.status}</Badge></td>
											<td class="num mono">{count.format(l.ms)} ms</td>
										</tr>
									{/each}
								</tbody>
							</Table>
						</Card>
					</div>
				</Tabs.Panel>
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

<CommandPalette
	{commands}
	bind:open={searching}
	shortcut={false}
	label="Search"
	placeholder="Search pages and sections…"
/>

<style>
	.frame {
		inline-size: 100%;
		block-size: 44rem;
		overflow: hidden;
		border-radius: var(--ui-radius);
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
		border-radius: var(--ui-radius);
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
		container: developers / inline-size;
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
	/* Three numbers in a row, sharing one height; two cards below. */
	.tiles,
	.split {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}
	.split {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
	}
	/* Narrow: the numbers stack; the key's creation date steps back. */
	@container developers (max-width: 26rem) {
		.tiles {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@container developers (max-width: 44rem) {
		.usage :global(.opt) {
			display: none;
		}
	}
	.big {
		font: 600 1.625rem/1 var(--ui-font-mono);
		font-variant-numeric: tabular-nums;
	}
	.meters {
		display: grid;
		gap: 0.875rem;
	}
	.errors {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.875rem;
	}
	.errors li {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
	}
	.when {
		display: block;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.bar-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.lead {
		margin: 0;
		color: var(--ui-muted);
	}
	.mono {
		font-family: var(--ui-font-mono);
		font-size: 0.8125rem;
	}
	.muted {
		color: var(--ui-muted);
	}
	.end {
		text-align: end;
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.usage :global(td) {
		white-space: nowrap;
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
