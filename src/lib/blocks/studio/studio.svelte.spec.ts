import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import axe from 'axe-core';
import '#lib/ui/tokens.css';
import Library from '../../../routes/blocks/studio/examples/library.svelte';
import Stat from './Stat.svelte';
import Studio from './Studio.svelte';
import { createRawSnippet } from 'svelte';

describe('studio', () => {
	it('desktop: marks the current page, names it in the breadcrumbs, and follows a choice', async () => {
		await page.viewport(1280, 900);
		render(Library);
		const nav = page.getByRole('navigation', { name: 'Bayt al-Ḥikma', exact: true });
		await expect
			.element(nav.getByRole('link', { name: 'Members' }))
			.toHaveAttribute('aria-current', 'page');
		const crumbs = page.getByRole('navigation', { name: /where you are/ });
		await expect.element(crumbs).toHaveTextContent('Members');

		await nav.getByRole('link', { name: 'Catalog' }).click();
		await expect
			.element(nav.getByRole('link', { name: 'Catalog' }))
			.toHaveAttribute('aria-current', 'page');
		await expect.element(crumbs).toHaveTextContent('Catalog');
	});

	it('desktop: the search narrows the menu and says when nothing matches', async () => {
		await page.viewport(1280, 900);
		render(Library);
		const nav = page.getByRole('navigation', { name: 'Bayt al-Ḥikma', exact: true });
		const search = page.getByRole('searchbox', { name: 'Search the menu' });
		await search.fill('cat');
		await expect.element(nav.getByRole('link', { name: 'Catalog' })).toBeVisible();
		await expect.element(nav.getByRole('link', { name: 'Members' })).not.toBeInTheDocument();

		await search.fill('zzz');
		await expect.element(page.getByRole('status')).toHaveTextContent('No page matches.');
		await search.fill('');
		await expect.element(nav.getByRole('link', { name: 'Members' })).toBeVisible();
	});

	it('phone: a bottom tab bar replaces the menu button, and More opens the full menu', async () => {
		await page.viewport(390, 844);
		render(Library);
		const tabs = page.getByRole('navigation', { name: 'Bayt al-Ḥikma: main pages' });
		await expect.element(tabs).toBeVisible();
		await expect
			.element(tabs.getByRole('link', { name: /Members/ }))
			.toHaveAttribute('aria-current', 'page');
		expect(tabs.getByRole('link').all()).toHaveLength(4);
		// The top bar's own menu button is gone (not shown, not offered to screen readers): the tab bar does its job.
		await expect
			.element(page.getByRole('button', { name: 'Open Bayt al-Ḥikma' }))
			.not.toBeInTheDocument();

		await tabs.getByRole('link', { name: 'Events' }).click();
		await expect
			.element(tabs.getByRole('link', { name: 'Events' }))
			.toHaveAttribute('aria-current', 'page');

		await tabs.getByRole('button', { name: 'More' }).click();
		const sheet = page.getByRole('dialog', { name: 'Bayt al-Ḥikma' });
		await expect.element(sheet).toBeVisible();
		// Pages that aren't tabs are reachable there.
		await expect.element(sheet.getByRole('link', { name: 'Settings' })).toBeVisible();
	});

	it('desktop, collapsed: the brand mark fits in the rail, whole and centered over the icons', async () => {
		await page.viewport(1280, 900);
		render(Library);
		await page
			.getByRole('button', { name: /Collapse sidebar/ })
			.first()
			.click();
		const mark = document.querySelector<HTMLElement>('.sidebar .mark')!;
		const head = mark.closest<HTMLElement>('.head')!;
		const icon = document.querySelector<SVGElement>('.sidebar nav .item svg')!;
		// Wait for the rail to finish narrowing.
		await expect.poll(() => head.getBoundingClientRect().width).toBeLessThan(60);
		const [m, h, i] = [mark, head, icon].map((el) => el.getBoundingClientRect());
		// Nothing of the mark is cut off by the header's clip.
		expect(m.left).toBeGreaterThanOrEqual(h.left);
		expect(m.right).toBeLessThanOrEqual(h.right);
		expect(head.scrollWidth).toBeLessThanOrEqual(head.clientWidth);
		// And it sits on the same center line as the icons below it.
		expect(Math.abs((m.left + m.right) / 2 - (i.left + i.right) / 2)).toBeLessThanOrEqual(1);
	});

	it('desktop: the tab bar stays hidden', async () => {
		await page.viewport(1280, 900);
		render(Library);
		// Hidden from everyone, screen readers included: role queries only find what is exposed.
		await expect
			.element(page.getByRole('navigation', { name: 'Bayt al-Ḥikma: main pages' }))
			.not.toBeInTheDocument();
	});

	it('a row opens its detail sheet with every field, from the keyboard too', async () => {
		await page.viewport(1280, 900);
		render(Library);
		const row = page.getByRole('button', { name: 'Ibn al-Haytham' });
		(row.element() as HTMLElement).focus();
		(row.element() as HTMLElement).click();
		const sheet = page.getByRole('dialog', { name: 'Ibn al-Haytham' });
		await expect.element(sheet).toBeVisible();
		await expect.element(sheet).toHaveTextContent('M-1022');
		await expect.element(sheet).toHaveTextContent('hasan@optics.example');
		await expect.element(sheet.getByRole('button', { name: 'Renew card' })).toBeVisible();
	});

	it('stat: screen readers get the real number, not the zeros it counts up from', async () => {
		render(Stat, { label: 'Members', value: '1,204' });
		await expect.element(page.getByLabelText('1,204')).toBeInTheDocument();
	});

	it('passes axe on desktop and phone', async () => {
		for (const [width, height] of [
			[1280, 900],
			[390, 844]
		]) {
			await page.viewport(width, height);
			const { unmount } = render(Library);
			const main = document.createElement('main');
			const frame = document.querySelector('.frame')!;
			frame.replaceWith(main);
			main.append(frame);
			const results = await axe.run(main);
			expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html.slice(0, 120)}`)).toEqual(
				[]
			);
			unmount();
			main.remove();
		}
	});
});

describe('studio rail', () => {
	const props = {
		name: 'Maktab',
		home: '/rail-test',
		groups: [{ items: [{ label: 'Home', href: '/rail-test' }] }],
		path: '/rail-test',
		user: { name: 'Amina' },
		search: false,
		children: createRawSnippet(() => ({ render: () => '<p>Page</p>' }))
	};

	it('holds the sidebar collapsed on a rail page, then gives back what the person chose', async () => {
		await page.viewport(1280, 900);
		localStorage.clear();
		const view = render(Studio, { ...props, rail: true });
		const toggle = page.getByRole('button', { name: /sidebar/ }).first();
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');

		// Expanding here is for now only: nothing is remembered.
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
		expect(JSON.stringify(localStorage)).not.toContain('rail-test-sidebar');

		await view.rerender({ ...props, rail: false });
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
		await view.rerender({ ...props, rail: true });
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
	});
});
