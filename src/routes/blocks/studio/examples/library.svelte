<script lang="ts">
	import {
		Add01Icon,
		BookOpen01Icon,
		Calendar03Icon,
		DashboardSquare01Icon,
		Download04Icon,
		Location01Icon,
		Mail01Icon,
		Search01Icon,
		Settings01Icon,
		Tag01Icon,
		TimeQuarterPassIcon,
		UserGroupIcon
	} from '@hugeicons/core-free-icons';
	import DetailSheet from '#lib/blocks/studio/DetailSheet.svelte';
	import PageHeader from '#lib/blocks/studio/PageHeader.svelte';
	import RowLink from '#lib/blocks/studio/RowLink.svelte';
	import Stat from '#lib/blocks/studio/Stat.svelte';
	import Studio from '#lib/blocks/studio/Studio.svelte';
	import Avatar from '#lib/ui/Avatar.svelte';
	import Badge from '#lib/ui/Badge.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import * as Menu from '#lib/ui/dropdown/index.js';
	import EmptyState from '#lib/ui/EmptyState.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Meter from '#lib/ui/Meter.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import SearchField from '#lib/ui/SearchField.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import Sparkline from '#lib/ui/Sparkline.svelte';
	import Table from '#lib/ui/Table.svelte';
	import { toast } from '#lib/ui/toast/index.js';

	// In an app, hrefs are real routes and `path` is `page.url.pathname`.
	const groups = [
		{
			items: [
				{ label: 'Overview', href: '#sx-overview', icon: DashboardSquare01Icon },
				{ label: 'Members', href: '#sx-members', icon: UserGroupIcon, badge: 3 },
				{ label: 'Catalog', href: '#sx-catalog', icon: BookOpen01Icon },
				{ label: 'Events', href: '#sx-events', icon: Calendar03Icon }
			]
		},
		{ title: 'Library', items: [{ label: 'Settings', href: '#sx-settings', icon: Settings01Icon }] }
	];
	let path = $state('#sx-members');

	// Actions offered in the search beside the pages.
	const commands = [
		{
			id: 'add',
			label: 'Add a member',
			group: 'Actions',
			icon: Add01Icon,
			keywords: ['new', 'card'],
			onselect: () => toast('The new member form would open here.')
		},
		{
			id: 'export',
			label: 'Export members',
			group: 'Actions',
			icon: Download04Icon,
			keywords: ['csv', 'download'],
			onselect: () => toast.success('The list is on its way to your email.')
		}
	];

	type Status = 'Active' | 'Overdue' | 'Waiting' | 'Paused';
	const members: {
		id: string;
		name: string;
		city: string;
		email: string;
		joined: string;
		loans: number;
		status: Status;
	}[] = [
		{
			id: 'M-1021',
			name: 'Fatima al-Fihri',
			city: 'Fez',
			email: 'fatima@qarawiyyin.example',
			joined: 'Mar 12, 2026',
			loans: 4,
			status: 'Active'
		},
		{
			id: 'M-1022',
			name: 'Ibn al-Haytham',
			city: 'Cairo',
			email: 'hasan@optics.example',
			joined: 'Apr 2, 2026',
			loans: 7,
			status: 'Overdue'
		},
		{
			id: 'M-1023',
			name: 'Maryam al-Ijliya',
			city: 'Aleppo',
			email: 'maryam@astrolabe.example',
			joined: 'May 19, 2026',
			loans: 1,
			status: 'Waiting'
		},
		{
			id: 'M-1024',
			name: 'Al-Khwarizmi',
			city: 'Baghdad',
			email: 'musa@hikma.example',
			joined: 'Jun 8, 2026',
			loans: 12,
			status: 'Active'
		},
		{
			id: 'M-1025',
			name: 'Al-Biruni',
			city: 'Ghazni',
			email: 'abu.rayhan@ghazni.example',
			joined: 'Jun 21, 2026',
			loans: 9,
			status: 'Active'
		},
		{
			id: 'M-1026',
			name: 'Lubna of Córdoba',
			city: 'Córdoba',
			email: 'lubna@qurtuba.example',
			joined: 'Jul 3, 2026',
			loans: 3,
			status: 'Paused'
		},
		{
			id: 'M-1027',
			name: 'Thabit ibn Qurra',
			city: 'Harran',
			email: 'thabit@harran.example',
			joined: 'Jul 30, 2026',
			loans: 6,
			status: 'Overdue'
		},
		{
			id: 'M-1028',
			name: 'Al-Jazari',
			city: 'Diyarbakır',
			email: 'ismail@devices.example',
			joined: 'Aug 14, 2026',
			loans: 2,
			status: 'Active'
		},
		{
			id: 'M-1029',
			name: 'Sutayta al-Mahamali',
			city: 'Baghdad',
			email: 'sutayta@hisab.example',
			joined: 'Sep 9, 2026',
			loans: 5,
			status: 'Active'
		},
		{
			id: 'M-1030',
			name: 'Al-Idrisi',
			city: 'Palermo',
			email: 'idrisi@rogeriana.example',
			joined: 'Oct 1, 2026',
			loans: 0,
			status: 'Waiting'
		}
	];
	const toneOf = (s: Status) =>
		s === 'Active'
			? 'accent'
			: s === 'Overdue'
				? 'danger'
				: s === 'Waiting'
					? 'warning'
					: 'neutral';

	let query = $state('');
	let status = $state('all');
	const statuses = [
		{ value: 'all', label: 'All' },
		{ value: 'Active', label: 'Active' },
		{ value: 'Overdue', label: 'Overdue' },
		{ value: 'Waiting', label: 'Waiting' }
	];
	const shown = $derived(
		members.filter(
			(m) =>
				(status === 'all' || m.status === status) &&
				`${m.name} ${m.city} ${m.id}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
		)
	);
	let pageNo = $state(1);

	const joinedPerWeek = [21, 26, 24, 31, 29, 35, 33, 38, 36, 41, 39, 44];
	const rooms = [
		{ name: 'Main hall', used: 38, seats: 60 },
		{ name: 'Manuscripts room', used: 21, seats: 24 },
		{ name: 'Observatory', used: 5, seats: 16 }
	];
	const activity = [
		{ who: 'Maryam al-Ijliya', what: 'asked for a reading card', when: '12 min ago' },
		{ who: 'Al-Biruni', what: 'borrowed India, a study of its people', when: '40 min ago' },
		{ who: 'Ibn al-Haytham', what: 'is 3 days late returning Book of Optics', when: '1 h ago' },
		{ who: 'Lubna of Córdoba', what: 'paused her card until spring', when: '3 h ago' },
		{ who: 'Al-Khwarizmi', what: 'renewed The Compendious Book', when: 'Yesterday' }
	];

	let openId = $state<string>();
	const member = $derived(members.find((m) => m.id === openId));
</script>

<div class="frame">
	<Studio
		name="Bayt al-Ḥikma"
		home="#sx-overview"
		{groups}
		{path}
		{commands}
		shortcut={false}
		height="100%"
		user={{ name: 'Hunayn ibn Ishaq', email: 'hunayn@hikma.example' }}
		onselect={(item) => (path = item.href)}
		onsignout={() => toast('Signed out.')}
	>
		{#snippet menu()}
			<Menu.Item onselect={() => toast('Settings would open here.')}
				><Icon icon={Settings01Icon} size={16} />Settings</Menu.Item
			>
		{/snippet}

		<div class="page">
			<PageHeader
				title="Members"
				description="Everyone with a reading card at the House of Wisdom."
			>
				{#snippet actions()}
					<Button
						variant="outline"
						onclick={() => toast.success('The list is on its way to your email.')}
						><Icon icon={Download04Icon} size={16} />Export</Button
					>
					<Button onclick={() => toast('The new member form would open here.')}
						><Icon icon={Add01Icon} size={16} />Add member</Button
					>
				{/snippet}
			</PageHeader>

			<div class="stats">
				<Stat label="Members" value="1,204" hint="38 joined this month" icon={UserGroupIcon} />
				<Stat
					label="Books on loan"
					value="3,871"
					hint="92% come back on time"
					icon={BookOpen01Icon}
				/>
				<Stat label="Overdue" value="27" hint="9 more than last week" icon={TimeQuarterPassIcon} />
				<Stat
					label="Waiting for a card"
					value="3"
					hint="The oldest asked 4 days ago"
					icon={Tag01Icon}
				/>
			</div>

			<div class="row">
				<Card
					level={2}
					title="Joined per week"
					description="The last 12 weeks; up 21% on the 12 before."
				>
					<div class="trend">
						<strong class="big">{joinedPerWeek.at(-1)}</strong>
						<span class="note">this week</span>
					</div>
					<Sparkline
						values={joinedPerWeek}
						label="New members per week, last 12 weeks: rising from 21 to 44"
						height={96}
					/>
				</Card>
				<Card level={2} title="Reading rooms now" description="Seats taken at 2:40 PM.">
					<div class="rooms">
						{#each rooms as r (r.name)}
							<Meter
								label={r.name}
								value={r.used}
								max={r.seats}
								low={r.seats * 0.6}
								high={r.seats * 0.85}
								optimum={r.seats * 0.4}
								format={(v, _, max) => `${v} of ${max} seats`}
							/>
						{/each}
					</div>
				</Card>
			</div>

			<div class="row wide">
				<Card level={2} title="All members" description="1,204 people hold a reading card." flush>
					<div class="toolbar">
						<SearchField
							label="Find a member"
							hideLabel
							placeholder="Name, city or card"
							bind:value={query}
						/>
						<Segmented label="Status" hideLabel options={statuses} bind:value={status} />
					</div>
					{#if shown.length}
						<Table caption="Members" hideCaption>
							<thead>
								<tr
									><th>Name</th><th class="opt">Card</th><th>City</th><th class="opt">Joined</th><th
										class="num">Loans</th
									><th>Status</th></tr
								>
							</thead>
							<tbody>
								{#each shown as m (m.id)}
									<tr>
										<td>
											<span class="who"
												><Avatar name={m.name} size="sm" decorative /><RowLink
													label={m.name}
													onclick={() => (openId = m.id)}
												/></span
											>
										</td>
										<td class="mono opt">{m.id}</td>
										<td>{m.city}</td>
										<td class="opt">{m.joined}</td>
										<td class="num">{m.loans}</td>
										<td><Badge tone={toneOf(m.status)}>{m.status}</Badge></td>
									</tr>
								{/each}
							</tbody>
						</Table>
					{:else}
						<EmptyState title="No member matches" icon={Search01Icon}>
							Try another name or city, or show every status.
							{#snippet actions()}
								<Button
									variant="outline"
									onclick={() => {
										query = '';
										status = 'all';
									}}>Clear the filters</Button
								>
							{/snippet}
						</EmptyState>
					{/if}
					{#snippet footer()}
						<span class="count">Showing 1–10 of 1,204</span>
						<Pagination bind:page={pageNo} count={121} label="Member pages" />
					{/snippet}
				</Card>

				<Card level={2} title="Recent activity" description="Cards, loans and returns today.">
					<ol class="feed">
						{#each activity as a (a.who + a.when)}
							<li>
								<Avatar name={a.who} size="sm" decorative />
								<p><strong>{a.who}</strong> {a.what}<span class="when">{a.when}</span></p>
							</li>
						{/each}
					</ol>
				</Card>
			</div>
		</div>
	</Studio>
</div>

<DetailSheet
	bind:open={() => Boolean(member), (open) => !open && (openId = undefined)}
	title={member?.name ?? 'Member'}
	description="Reading card {member?.id ?? ''}"
	fields={member
		? [
				{ label: 'Card number', value: member.id, icon: Tag01Icon, mono: true },
				{ label: 'Email', value: member.email, icon: Mail01Icon },
				{ label: 'City', value: member.city, icon: Location01Icon },
				{ label: 'Joined', value: member.joined, icon: Calendar03Icon },
				{ label: 'Books on loan', value: String(member.loans), icon: BookOpen01Icon, mono: true }
			]
		: []}
>
	{#snippet lead()}
		{#if member}<Badge tone={toneOf(member.status)}>{member.status}</Badge>{/if}
	{/snippet}
	{#snippet footer()}
		<Button variant="outline" onclick={() => (openId = undefined)}>Close</Button>
		<Button onclick={() => toast('The card would be renewed.')}>Renew card</Button>
	{/snippet}
</DetailSheet>

<style>
	.frame {
		inline-size: 100%;
		block-size: 46rem;
		overflow: hidden;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		border: 1px solid var(--ui-field-line);
	}
	.page {
		display: grid;
		gap: 1.25rem;
		padding: 1.25rem 1.5rem 2rem;
		container: members / inline-size;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
		gap: 1rem;
	}
	/* Cards in a row share one height; the wide row gives the table most of the width. */
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: 1rem;
		align-items: stretch;
	}
	.row.wide {
		grid-template-columns: minmax(0, 2.2fr) minmax(min(100%, 16rem), 1fr);
	}
	@container members (max-width: 60rem) {
		.row.wide {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.trend {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}
	.big {
		font: 600 1.75rem/1 var(--ui-font-mono);
		font-variant-numeric: tabular-nums;
	}
	.note,
	.count,
	.when {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.rooms {
		display: grid;
		gap: 0.875rem;
	}
	/* Search and the status filter, in one row across the top of the table. */
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-block-end: 1px solid var(--ui-line);
	}
	.toolbar > :global(:first-child) {
		flex: 1 1 12rem;
	}
	.row :global(td) {
		white-space: nowrap;
	}
	/* Narrow: the card and joined date step back; the row's sheet still has them. */
	@container members (max-width: 48rem) {
		.row :global(.opt) {
			display: none;
		}
	}
	.who {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
	}
	.mono {
		font-family: var(--ui-font-mono);
		font-size: 0.8125rem;
		color: var(--ui-muted);
	}
	.count {
		margin-inline-end: auto;
	}
	.feed {
		display: grid;
		gap: 0.875rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.feed li {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
	}
	.feed p {
		margin: 0;
		line-height: 1.45;
	}
	.when {
		display: block;
		margin-block-start: 0.125rem;
	}
	@media (width < 40rem) {
		.page {
			padding-inline: 1rem;
		}
	}
</style>
