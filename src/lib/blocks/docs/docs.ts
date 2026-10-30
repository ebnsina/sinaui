import type { DocsNavGroup, DocsNavItem } from '#lib/ui/DocsNav.svelte';

/** A top-bar tab ("Guides", "API reference") and the sidebar groups it shows. */
export interface DocsSection {
	label: string;
	/** Where the tab links: usually its first page. */
	href: string;
	groups: DocsNavGroup[];
}

/** Where a page sits in the docs: its tab, its group, and the pages either side of it. */
export interface DocsPlace {
	section: DocsSection;
	group?: DocsNavGroup;
	item?: DocsNavItem;
	prev?: DocsNavItem;
	next?: DocsNavItem;
}

// "/guides/" and "/guides" are the same page.
const trim = (href: string) => href.replace(/(.)\/+$/, '$1');

/**
 * Finds the page at `current` in the nav. Previous and next run through every page in nav order,
 * across tabs. A path that isn't in the nav (a 404) lands on the first tab with no page.
 */
export function locate(sections: DocsSection[], current: string): DocsPlace {
	if (!sections.length) throw new Error('Docs need at least one section');
	const path = trim(current);
	const pages = sections.flatMap((section) =>
		section.groups.flatMap((group) => group.items.map((item) => ({ section, group, item })))
	);
	const at = pages.findIndex((p) => trim(p.item.href) === path);
	if (at < 0) return { section: sections[0] };
	return { ...pages[at], prev: pages[at - 1]?.item, next: pages[at + 1]?.item };
}
