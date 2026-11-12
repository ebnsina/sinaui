<script lang="ts">
	import {
		BookOpen01Icon,
		Calendar03Icon,
		DashboardSquare01Icon,
		Location01Icon,
		Mail01Icon,
		Settings01Icon,
		Tag01Icon,
		UserGroupIcon
	} from '@hugeicons/core-free-icons';
	import DetailSheet from '#lib/blocks/studio/DetailSheet.svelte';
	import PageHeader from '#lib/blocks/studio/PageHeader.svelte';
	import RowLink from '#lib/blocks/studio/RowLink.svelte';
	import Stat from '#lib/blocks/studio/Stat.svelte';
	import Studio from '#lib/blocks/studio/Studio.svelte';
	import Badge from '#lib/ui/Badge.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import * as Menu from '#lib/ui/dropdown/index.js';
	import Icon from '#lib/ui/Icon.svelte';
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

	const members = [
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
			status: 'Active'
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
		}
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
			<PageHeader title="Members" description="Everyone with a reading card.">
				{#snippet actions()}
					<Button onclick={() => toast('The new member form would open here.')}>Add member</Button>
				{/snippet}
			</PageHeader>

			<div class="stats">
				<Stat label="Members" value="1,204" hint="38 joined this month" icon={UserGroupIcon} />
				<Stat
					label="Books on loan"
					value="3,871"
					hint="92% returned on time"
					icon={BookOpen01Icon}
				/>
				<Stat label="Waiting for a card" value="3" icon={Tag01Icon} />
			</div>

			<Card flush>
				<Table caption="Members" hideCaption>
					<thead>
						<tr><th>Name</th><th>City</th><th class="num">Loans</th><th>Status</th></tr>
					</thead>
					<tbody>
						{#each members as m (m.id)}
							<tr>
								<td><RowLink label={m.name} onclick={() => (openId = m.id)} /></td>
								<td>{m.city}</td>
								<td class="num">{m.loans}</td>
								<td
									><Badge tone={m.status === 'Active' ? 'accent' : 'warning'}>{m.status}</Badge></td
								>
							</tr>
						{/each}
					</tbody>
				</Table>
			</Card>
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
		{#if member}<Badge tone={member.status === 'Active' ? 'accent' : 'warning'}
				>{member.status}</Badge
			>{/if}
	{/snippet}
	{#snippet footer()}
		<Button variant="outline" onclick={() => (openId = undefined)}>Close</Button>
		<Button onclick={() => toast('The card would be renewed.')}>Renew card</Button>
	{/snippet}
</DetailSheet>

<style>
	.frame {
		inline-size: 100%;
		block-size: 40rem;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) + 0.25rem);
		background: var(--ui-surface);
		border: 1px solid var(--ui-field-line);
	}
	.page {
		display: grid;
		gap: 1.25rem;
		padding: 1.25rem 1.5rem 2rem;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
		gap: 1rem;
	}
	@media (width < 40rem) {
		.page {
			padding-inline: 1rem;
		}
	}
</style>
