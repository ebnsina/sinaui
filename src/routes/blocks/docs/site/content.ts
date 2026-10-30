// A pretend product's docs, written once as blocks: the page renders them, and the same blocks are
// written out as the page's Markdown (for "Copy page as Markdown" and the .md address).
import { resolve } from '$app/paths';
import type { CodeSample } from '#lib/blocks/docs/CodeTabs.svelte';
import type { DocsSection } from '#lib/blocks/docs/docs.js';
import type { TocItem } from '#lib/ui/Toc.svelte';

export type Block =
	| { kind: 'h2'; id: string; text: string }
	| { kind: 'h3'; id: string; text: string }
	| { kind: 'p'; text: string }
	| { kind: 'list'; items: string[] }
	| { kind: 'code'; samples: CodeSample[] };

export interface DocPage {
	/** '' for the first page. */
	slug: string;
	title: string;
	description: string;
	blocks: Block[];
}

export const product = 'Warraq';
export const root = resolve('/blocks/docs/site' as '/');
export const href = (slug: string) => (slug ? `${root}/${slug}` : root);
export const markdownHref = (slug: string) => `${root}/${slug || 'index'}.md`;

const key = 'wq_live_3f9a7c21';
const request = (path: string): CodeSample[] => [
	{
		label: 'curl',
		lang: 'shell',
		code: `curl https://api.warraq.dev/v1${path} \\\n  -H "Authorization: Bearer ${key}"`
	},
	{
		label: 'JavaScript',
		lang: 'js',
		code: `const res = await fetch('https://api.warraq.dev/v1${path}', {\n  headers: { Authorization: \`Bearer \${process.env.WARRAQ_KEY}\` }\n});\nconst body = await res.json();`
	},
	{
		label: 'Python',
		lang: 'python',
		code: `import os, requests\n\nres = requests.get(\n    "https://api.warraq.dev/v1${path}",\n    headers={"Authorization": f"Bearer {os.environ['WARRAQ_KEY']}"},\n)\nbody = res.json()`
	}
];

export const pages: DocPage[] = [
	{
		slug: '',
		title: 'Introduction',
		description:
			'Warraq catalogs manuscripts: upload a scan, and it reads the title, the copyist and the date, then makes the whole collection searchable.',
		blocks: [
			{ kind: 'h2', id: 'what-you-can-build', text: 'What you can build' },
			{
				kind: 'p',
				text: 'Libraries use Warraq to put a reading room online. Each manuscript gets a record you can search by title, author, copyist, place and century.'
			},
			{
				kind: 'list',
				items: [
					'A public catalog with full-text search across every folio.',
					'A request form that tells readers which copy is free to borrow.',
					'A nightly export to your own archive, as JSON or CSV.'
				]
			},
			{ kind: 'h2', id: 'how-it-fits', text: 'How it fits together' },
			{
				kind: 'p',
				text: 'You send scans to the `manuscripts` endpoint. Warraq reads them in the background and calls your webhook when a record is ready, usually within two minutes.'
			},
			{ kind: 'h3', id: 'collections', text: 'Collections' },
			{
				kind: 'p',
				text: 'A collection groups manuscripts that belong to one library or donor. Keys are scoped to a collection, so a reading room in Cordoba never sees Baghdad’s records.'
			},
			{ kind: 'h2', id: 'next-steps', text: 'Next steps' },
			{
				kind: 'p',
				text: 'Follow the quickstart to catalog your first manuscript in about five minutes.'
			}
		]
	},
	{
		slug: 'quickstart',
		title: 'Quickstart',
		description: 'Create a key, send your first scan and read the record Warraq makes from it.',
		blocks: [
			{ kind: 'h2', id: 'create-a-key', text: 'Create a key' },
			{
				kind: 'p',
				text: 'In the dashboard, open Settings, then API keys, and choose New key. Copy it now: it is shown once. Keep it in an environment variable named `WARRAQ_KEY`.'
			},
			{ kind: 'h2', id: 'install', text: 'Install the client' },
			{
				kind: 'code',
				samples: [
					{ label: 'pnpm', lang: 'shell', code: 'pnpm add @warraq/client' },
					{ label: 'npm', lang: 'shell', code: 'npm install @warraq/client' },
					{ label: 'pip', lang: 'shell', code: 'pip install warraq' }
				]
			},
			{ kind: 'h2', id: 'first-request', text: 'Make your first request' },
			{
				kind: 'p',
				text: 'List the manuscripts in your collection. A new collection comes with one sample, so the list is never empty.'
			},
			{ kind: 'code', samples: request('/manuscripts?limit=1') },
			{ kind: 'h3', id: 'read-the-result', text: 'Read the result' },
			{
				kind: 'p',
				text: 'The response holds a `data` list and a `next` cursor. Pass `next` back as `after` to read the following page.'
			}
		]
	},
	{
		slug: 'authentication',
		title: 'Authentication',
		description:
			'Every request carries a key in the Authorization header. Here is how to send, scope and rotate one.',
		blocks: [
			{ kind: 'h2', id: 'sending-the-key', text: 'Sending the key' },
			{
				kind: 'p',
				text: 'Send the key as a bearer token. Requests without one get `401` with the code `missing_key`.'
			},
			{ kind: 'code', samples: request('/collections') },
			{ kind: 'h2', id: 'scopes', text: 'Scopes' },
			{
				kind: 'list',
				items: [
					'`read` lists and fetches records.',
					'`write` adds scans and edits records.',
					'`admin` manages keys and webhooks.'
				]
			},
			{ kind: 'h2', id: 'rotating', text: 'Rotating a key' },
			{
				kind: 'p',
				text: 'Create the new key first, deploy it, then revoke the old one. Both work in the meantime, so nothing fails while you switch.'
			}
		]
	},
	{
		slug: 'manuscripts',
		title: 'Manuscripts',
		description: 'List, fetch and add manuscripts in a collection.',
		blocks: [
			{ kind: 'h2', id: 'list', text: 'List manuscripts' },
			{
				kind: 'p',
				text: '`GET /v1/manuscripts` returns the newest first, 20 at a time. Filter with `century`, `place` or `q` for full-text search.'
			},
			{ kind: 'code', samples: request('/manuscripts?place=Baghdad') },
			{ kind: 'h2', id: 'object', text: 'The manuscript object' },
			{
				kind: 'code',
				samples: [
					{
						label: 'Response',
						lang: 'json',
						filename: '200 OK',
						code: `{\n  "id": "ms_8d21",\n  "title": "Kitāb al-Jabr wa-l-Muqābala",\n  "author": "al-Khwārizmī",\n  "copyist": "Yūsuf ibn ʿAlī",\n  "place": "Baghdad",\n  "century": 12,\n  "status": "ready"\n}`
					}
				]
			},
			{ kind: 'h3', id: 'status', text: 'Status' },
			{
				kind: 'p',
				text: 'A new scan is `reading` until Warraq finishes with it, then `ready`. A scan it can’t read is `failed`, with the reason in `error`.'
			}
		]
	}
];

export const sections: DocsSection[] = [
	{
		label: 'Guides',
		href: href(''),
		groups: [
			{
				title: 'Get started',
				items: [
					{ label: 'Introduction', href: href('') },
					{ label: 'Quickstart', href: href('quickstart') }
				]
			},
			{ title: 'Essentials', items: [{ label: 'Authentication', href: href('authentication') }] }
		]
	},
	{
		label: 'API reference',
		href: href('manuscripts'),
		groups: [
			{
				title: 'Endpoints',
				items: [{ label: 'Manuscripts', href: href('manuscripts'), badge: 'v1' }]
			}
		]
	}
];

export const find = (slug: string) => pages.find((p) => p.slug === slug);

export const toc = (page: DocPage): TocItem[] =>
	page.blocks.flatMap((b) =>
		b.kind === 'h2' || b.kind === 'h3'
			? [{ id: b.id, label: b.text, level: b.kind === 'h2' ? 2 : 3 }]
			: []
	);

export function markdown(page: DocPage): string {
	const body = page.blocks.map((b) => {
		if (b.kind === 'h2') return `## ${b.text}`;
		if (b.kind === 'h3') return `### ${b.text}`;
		if (b.kind === 'p') return b.text;
		if (b.kind === 'list') return b.items.map((i) => `- ${i}`).join('\n');
		return b.samples.map((s) => `\`\`\`${s.lang ?? ''}\n${s.code}\n\`\`\``).join('\n\n');
	});
	return [`# ${page.title}`, page.description, ...body].join('\n\n') + '\n';
}
