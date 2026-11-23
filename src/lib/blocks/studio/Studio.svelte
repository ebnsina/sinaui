<script lang="ts">
	// The frame of a signed-in app (an admin, a portal, a dashboard): a grouped sidebar, breadcrumbs,
	// a top bar with search (a command palette of every page) and the account menu, and on phones a
	// bottom tab bar like a mobile app's.
	import { Search01Icon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import AccountMenu from '#lib/ui/AccountMenu.svelte';
	import Button from '#lib/ui/Button.svelte';
	import CommandPalette, { type Command } from '#lib/ui/CommandPalette.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Kbd from '#lib/ui/Kbd.svelte';
	import SidebarLayout, { type SidebarGroup, type SidebarItem } from '#lib/ui/SidebarLayout.svelte';

	interface Props {
		/** The app or organization: names the navigation and is the first breadcrumb. */
		name: string;
		/** The app's first page; the first breadcrumb and the brand link go there. */
		home: string;
		groups: SidebarGroup[];
		/** The address being shown (`page.url.pathname` in SvelteKit); decides the current item. */
		path: string;
		/** The signed-in person, for the account menu. */
		user: { name: string; email?: string; image?: string };
		/** Runs when "Sign out" is chosen; the item shows only when given. */
		onsignout?: () => void;
		/** Called when a navigation item is chosen (links still navigate). */
		onselect?: (item: SidebarItem) => void;
		/** Your logo, in place of the letter mark and name; given whether the sidebar is collapsed. */
		brand?: Snippet<[boolean]>;
		/** In the top bar before the account menu: a search button, a switcher, a status. */
		tools?: Snippet;
		/** Your own items in the account menu (settings, a link to the website). */
		menu?: Snippet;
		/**
		 * The pages in the phone tab bar (up to four). Left unset, the first group's pages are used;
		 * false keeps the menu button instead.
		 */
		tabs?: SidebarItem[] | false;
		/** A search button in the top bar that opens a command palette of every page (and `commands`). */
		search?: boolean;
		/** Actions to offer in the search beside the pages ("Add member", "Export"). */
		commands?: Command[];
		/** Open the search with ⌘K (Ctrl+K elsewhere). Turn off when the page already binds it. */
		shortcut?: boolean;
		/** Show the sidebar as the icon rail on this page (a lesson, an editor); the person's choice returns after. */
		rail?: boolean;
		/** The page sits in a rounded panel; the sidebar shares the window's tint. */
		inset?: boolean;
		/** How tall the frame is. It fills the window by default. */
		height?: string;
		/** Translate these for non-English UIs. */
		labels?: {
			search?: string;
			/** The search field's placeholder. */
			placeholder?: string;
			/** Shown when the search matches nothing. */
			noMatch?: string;
			/** The heading of pages from a group without a title. */
			pages?: string;
			more?: string;
			account?: string;
			signOut?: string;
			darkTheme?: string;
			lightTheme?: string;
		};
		children: Snippet;
	}
	let {
		name,
		home,
		groups,
		path,
		user,
		onsignout,
		onselect,
		brand,
		tools,
		menu,
		tabs,
		search = true,
		commands = [],
		shortcut = true,
		inset = true,
		rail = false,
		height = '100dvh',
		labels = {},
		children
	}: Props = $props();

	const t = $derived({
		search: 'Search',
		placeholder: 'Search pages and actions…',
		noMatch: 'Nothing matches.',
		pages: 'Pages',
		more: 'More',
		...labels
	});

	// Every page, children included: the search and the current page look through all of them.
	const flat = (items: SidebarItem[]): SidebarItem[] =>
		items.flatMap((i) => [i, ...flat(i.children ?? [])]);
	const all = $derived(flat(groups.flatMap((g) => g.items)));

	// The search lists every page under its sidebar group, then your own actions.
	let searching = $state(false);
	let frame: HTMLDivElement;
	// Through a real link click, so the app's router (SvelteKit's, say) navigates as for any link.
	const go = (item: SidebarItem) => {
		onselect?.(item);
		const a = Object.assign(document.createElement('a'), { href: item.href, hidden: true });
		frame.append(a);
		a.click();
		a.remove();
	};
	const palette = $derived<Command[]>([
		...groups.flatMap((g) =>
			flat(g.items).map((item) => ({
				id: `page:${item.href}`,
				label: item.label,
				group: g.title ?? t.pages,
				icon: item.icon,
				onselect: () => go(item)
			}))
		),
		...commands
	]);
	// The current page is the deepest item whose address starts the path.
	const current = $derived(
		[...all]
			.sort((a, b) => b.href.length - a.href.length)
			.find((i) => path === i.href || path.startsWith(`${i.href}/`))
	);
	const crumbs = $derived([
		{ label: name, href: home },
		...(current && current.href !== home ? [{ label: current.label }] : [])
	]);
	const phoneTabs = $derived(tabs === false ? undefined : (tabs ?? groups[0]?.items));
</script>

<div class="studio" style:block-size={height} bind:this={frame}>
	<SidebarLayout
		label={name}
		{groups}
		current={current?.href}
		{crumbs}
		{inset}
		{rail}
		{onselect}
		tabs={phoneTabs}
		moreLabel={t.more}
		persist="{home}-sidebar"
	>
		{#snippet header(collapsed)}
			<div class="head">
				<a class="brand" href={home} aria-label={name}>
					{#if brand}
						{@render brand(collapsed)}
					{:else}
						<span class="mark" aria-hidden="true">{name.slice(0, 1)}</span>
						{#if !collapsed}<strong>{name}</strong>{/if}
					{/if}
				</a>
			</div>
		{/snippet}
		{#snippet topbar()}
			<div class="bar">
				{#if search}
					<Button
						variant="outline"
						aria-label={t.search}
						aria-haspopup="dialog"
						onclick={() => (searching = true)}
					>
						<Icon icon={Search01Icon} size={16} /><span class="find">{t.search}</span>
						{#if shortcut}<Kbd keys={['mod', 'K']} />{/if}
					</Button>
				{/if}
				{@render tools?.()}
				<AccountMenu {user} theme {onsignout} {labels}>
					{@render menu?.()}
				</AccountMenu>
			</div>
		{/snippet}
		{@render children()}
	</SidebarLayout>
</div>

{#if search}
	<CommandPalette
		commands={palette}
		bind:open={searching}
		{shortcut}
		label={t.search}
		placeholder={t.placeholder}
		empty={t.noMatch}
	/>
{/if}

<style>
	.head {
		display: grid;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		color: inherit;
		text-decoration: none;
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
	/* On a phone the search button is its icon alone; the shortcut means nothing without a keyboard. */
	@container (max-width: 40rem) {
		.bar :global(:is(.find, kbd)) {
			display: none;
		}
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
