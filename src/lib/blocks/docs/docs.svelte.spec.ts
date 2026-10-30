import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import '#lib/ui/tokens.css';
import CodeTabs from './CodeTabs.svelte';
import DocsLayout from './DocsLayout.svelte';
import DocsPage from './DocsPage.svelte';
import type { DocsSection } from './docs';

const sections: DocsSection[] = [
	{
		label: 'Guides',
		href: '#intro',
		groups: [
			{
				title: 'Get started',
				items: [
					{ label: 'Introduction', href: '#intro' },
					{ label: 'Quickstart', href: '#quickstart' }
				]
			}
		]
	},
	{
		label: 'API reference',
		href: '#books',
		groups: [{ items: [{ label: 'Books', href: '#books' }] }]
	}
];
const text = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('docs block', () => {
	// Wide enough for the tabs, the sidebar and the contents rail.
	beforeEach(() => page.viewport(1440, 900));

	it('layout: marks the current tab and page, and search finds pages by title', async () => {
		const went: string[] = [];
		render(DocsLayout, {
			name: 'Warraq',
			sections,
			current: '#quickstart',
			onnavigate: (href: string) => went.push(href),
			children: text('<p>Body</p>')
		});
		const tabs = page.getByRole('navigation', { name: 'Warraq docs sections' });
		await expect
			.element(tabs.getByRole('link', { name: 'Guides' }))
			.toHaveAttribute('aria-current', 'page');
		await expect
			.element(tabs.getByRole('link', { name: 'API reference' }))
			.not.toHaveAttribute('aria-current');
		const side = page.getByRole('navigation', { name: 'Guides' });
		await expect
			.element(side.getByRole('link', { name: 'Quickstart' }))
			.toHaveAttribute('aria-current', 'page');
		await expect
			.element(side.getByRole('link', { name: 'Introduction' }))
			.not.toHaveAttribute('aria-current');
		await expect.element(page.getByRole('main')).toHaveTextContent('Body');

		await page.getByRole('button', { name: 'Search the docs' }).click();
		await page.getByRole('combobox').fill('books');
		await page.getByRole('option', { name: 'Books' }).click();
		expect(went).toEqual(['#books']);
	});

	it('layout: one section shows no tabs', async () => {
		render(DocsLayout, {
			name: 'Warraq',
			sections: [sections[0]],
			current: '#intro',
			children: text('<p></p>')
		});
		await expect.element(page.getByRole('link', { name: 'Introduction' }).first()).toBeVisible();
		expect(document.querySelector('nav[aria-label="Warraq docs sections"]')).toBeNull();
	});

	it('page: the contents rail follows the scroll', async () => {
		scrollTo(0, 0);
		const r = render(DocsPage, {
			title: 'Quickstart',
			toc: [
				{ id: 'dp-one', label: 'One' },
				{ id: 'dp-two', label: 'Two' }
			],
			children: text(
				'<div><h2 id="dp-one" style="height:1500px">One</h2><h2 id="dp-two" style="height:1500px">Two</h2></div>'
			)
		});
		try {
			const rail = page.getByRole('navigation', { name: 'On this page' });
			const current = () => rail.element().querySelector('[aria-current="location"]')?.textContent;
			await expect.poll(current).toBe('One');
			scrollTo(0, document.getElementById('dp-two')!.getBoundingClientRect().top + scrollY);
			await expect.poll(current).toBe('Two');
		} finally {
			r.unmount();
			scrollTo(0, 0);
		}
	});

	it('page: copies the Markdown source, says when it fails, and links prev and next', async () => {
		let copied = '';
		const real = Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard');
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: async (t: string) => void (copied = t) }
		});
		const quiet = console.error;
		console.error = () => {};
		try {
			const ok = render(DocsPage, {
				title: 'Quickstart',
				markdown: async () => '# Quickstart\n',
				markdownHref: '/quickstart.md',
				prev: { label: 'Introduction', href: '/' },
				next: { label: 'Books', href: '/books' },
				children: text('<p>Body</p>')
			});
			await expect
				.element(page.getByRole('link', { name: 'View as Markdown' }))
				.toHaveAttribute('href', '/quickstart.md');
			await expect
				.element(page.getByRole('link', { name: /Previous\s*Introduction/ }))
				.toHaveAttribute('rel', 'prev');
			await expect
				.element(page.getByRole('link', { name: /Next\s*Books/ }))
				.toHaveAttribute('href', '/books');
			await page.getByRole('button', { name: 'Copy page as Markdown' }).click();
			await expect.poll(() => copied).toBe('# Quickstart\n');
			ok.unmount();

			render(DocsPage, {
				title: 'Broken',
				markdown: async () => {
					throw new Error('offline');
				},
				children: text('<p>Body</p>')
			});
			await page.getByRole('button', { name: 'Copy page as Markdown' }).click();
			await expect.element(page.getByText("Couldn't copy").first()).toBeInTheDocument();
		} finally {
			console.error = quiet;
			delete (navigator as { clipboard?: unknown }).clipboard;
			if (real) Object.defineProperty(Navigator.prototype, 'clipboard', real);
		}
	});

	it('page: no Markdown actions, rail or pager without their props', async () => {
		render(DocsPage, { title: 'Bare', children: text('<p>Body</p>') });
		await expect.element(page.getByRole('heading', { name: 'Bare', level: 1 })).toBeVisible();
		expect(
			document.querySelector('.docs-page .actions, .docs-page .pager, .docs-page .toc')
		).toBeNull();
	});

	it('code tabs: switch language, report the pick, and fall back to the first tab', async () => {
		let value = $state<string | undefined>('Ruby');
		const samples = [
			{ label: 'curl', lang: 'shell' as const, code: 'curl /books' },
			{ label: 'JavaScript', lang: 'js' as const, code: "fetch('/books')" }
		];
		render(CodeTabs, {
			samples,
			get value() {
				return value;
			},
			set value(v) {
				value = v;
			}
		});
		const tabs = page.getByRole('tablist', { name: 'Language' });
		await expect
			.element(tabs.getByRole('tab', { name: 'curl' }))
			.toHaveAttribute('aria-selected', 'true');
		await tabs.getByRole('tab', { name: 'JavaScript' }).click();
		await expect
			.element(tabs.getByRole('tab', { name: 'JavaScript' }))
			.toHaveAttribute('aria-selected', 'true');
		expect(value).toBe('JavaScript');
		await expect
			.element(page.getByRole('tabpanel', { name: 'JavaScript' }))
			.toHaveTextContent("fetch('/books')");
	});

	it('code tabs: one sample is a plain code block', async () => {
		render(CodeTabs, { samples: [{ label: 'JSON', lang: 'json', code: '{}' }] });
		await expect.element(page.getByText('{}')).toBeVisible();
		expect(document.querySelector('[role="tablist"]')).toBeNull();
	});
});
