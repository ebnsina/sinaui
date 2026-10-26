<script lang="ts">
	import {
		Add01Icon,
		Alert02Icon,
		BubbleChatIcon,
		CallOutgoing01Icon,
		Chemistry01Icon,
		DashboardSquare02Icon,
		Folder01Icon,
		Home01Icon,
		Message01Icon,
		Notification01Icon,
		PuzzleIcon,
		RadioIcon,
		SentIcon,
		SmartPhone01Icon,
		UserMultipleIcon,
		Wrench01Icon
	} from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import SearchField from '#lib/ui/SearchField.svelte';
	import SidebarLayout, { type SidebarGroup } from '#lib/ui/SidebarLayout.svelte';

	const all: SidebarGroup[] = [
		{
			items: [
				{ label: 'Home', href: '#studio-home', icon: Home01Icon },
				{ label: 'Guide', href: '#studio-guide', icon: SentIcon },
				{ label: 'Issues', href: '#studio-issues', icon: Alert02Icon, badge: 2 }
			]
		},
		{
			title: 'Agents',
			items: [{ label: 'Create agent', href: '#studio-create', icon: Add01Icon }]
		},
		{
			title: 'Configure',
			items: [
				{ label: 'Knowledge base', href: '#studio-knowledge', icon: Folder01Icon },
				{ label: 'Tools', href: '#studio-tools', icon: Wrench01Icon },
				{ label: 'Integrations', href: '#studio-integrations', icon: PuzzleIcon },
				{ label: 'Voices', href: '#studio-voices', icon: DashboardSquare02Icon }
			]
		},
		{
			title: 'Monitor',
			items: [
				{ label: 'Conversations', href: '#studio-conversations', icon: Message01Icon },
				{ label: 'Users', href: '#studio-users', icon: UserMultipleIcon },
				{ label: 'Tests', href: '#studio-tests', icon: Chemistry01Icon }
			]
		},
		{
			title: 'Deploy',
			items: [
				{ label: 'Channels', href: '#studio-channels', icon: RadioIcon },
				{ label: 'Phone numbers', href: '#studio-phones', icon: SmartPhone01Icon },
				{ label: 'Chat apps', href: '#studio-chat', icon: BubbleChatIcon },
				{ label: 'Outbound', href: '#studio-outbound', icon: CallOutgoing01Icon }
			]
		}
	];
	let query = $state('');
	// Searching narrows the menu to matching pages; empty groups drop out.
	const groups = $derived(
		all
			.map((g) => ({
				...g,
				items: g.items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()))
			}))
			.filter((g) => g.items.length)
	);
	let current = $state('#studio-conversations');
	const title = $derived(all.flatMap((g) => g.items).find((i) => i.href === current)?.label);
</script>

<!-- A framed app for the example; in your app, give the layout the whole window. -->
<div class="frame">
	<SidebarLayout label="Studio" {groups} {current} onselect={(item) => (current = item.href)}>
		{#snippet header(collapsed)}
			<div class="head">
				<strong class="logo">{collapsed ? 'B' : 'Bayt al-Ḥikma'}</strong>
				{#if !collapsed}
					<SearchField
						label="Search pages"
						hideLabel
						placeholder="Search & create"
						bind:value={query}
					/>
				{/if}
			</div>
		{/snippet}
		{#snippet footer()}
			<div class="product">
				<span class="swatch" aria-hidden="true"></span>
				<span class="name">Agents</span>
				<Button size="sm" variant="outline">Switch</Button>
			</div>
		{/snippet}
		{#snippet topbar()}
			<div class="top">
				<strong>{title}</strong>
				<span class="actions">
					<Button size="sm" variant="outline">What's new</Button>
					<Button size="sm" variant="outline">Docs</Button>
					<Button size="sm" variant="outline" square aria-label="Notifications">
						<Icon icon={Notification01Icon} size={16} />
					</Button>
				</span>
			</div>
		{/snippet}
		<div class="page">
			<h4>{title}</h4>
			<p>Search the menu, or press ⌘B or Ctrl+B to fold it to icons.</p>
		</div>
	</SidebarLayout>
</div>

<style>
	/* Measured from a studio-style dashboard: a pale rail, 32px rows, 10px corners, larger type. */
	.frame {
		--ui-sidebar-bg: light-dark(#fafafa, #111111);
		--ui-sidebar-line: var(--ui-line);
		--ui-sidebar-current-bg: var(--ui-subtle);
		--ui-sidebar-w: 16rem;
		--ui-sidebar-item-h: 2rem;
		--ui-sidebar-font: 0.9375rem;
		--ui-sidebar-title-font: 0.875rem;
		--ui-radius: 0.625rem;
		--ui-control-h: 2rem;
		--ui-control-font: 0.8125rem;
		inline-size: 100%;
		block-size: 36rem;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
	}
	.head {
		display: grid;
		gap: 0.75rem;
	}
	.logo {
		font-size: 1.0625rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.product {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding-inline: 0.5rem 0;
	}
	.swatch {
		inline-size: 1rem;
		block-size: 1rem;
		border-radius: 0.25rem;
		background: linear-gradient(135deg, #2f6f4f, #6aa6c8);
	}
	.name {
		flex: 1;
		min-inline-size: 0;
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-inline: 0.25rem;
	}
	.actions {
		display: flex;
		gap: 0.375rem;
	}
	@container (width < 34rem) {
		.actions {
			display: none;
		}
	}
	.page {
		padding: 2rem 2.5rem;
	}
	.page h4 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		font-weight: 400;
		letter-spacing: -0.01em;
	}
	.page p {
		margin: 0;
		color: var(--ui-muted);
	}
</style>
