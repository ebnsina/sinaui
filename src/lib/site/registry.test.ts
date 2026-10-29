import { describe, expect, it } from 'vitest';
import { pro, registry } from './registry';

const pages = import.meta.glob<string>('/src/routes/**/+page.svelte', {
	eager: true,
	query: '?raw',
	import: 'default'
});

describe('registry', () => {
	it('builds every item, each with its files and no import left unresolved', () => {
		for (const [name, build] of Object.entries(registry)) {
			const item = build();
			expect(item.files.length, name).toBeGreaterThan(0);
		}
	});
	it('never serves Pro unless SINAUI_PRO=1, and nothing public pulls in a Pro file', () => {
		const served = Object.keys(registry).filter((n) => n.startsWith('pro/'));
		expect(served).toEqual(process.env.SINAUI_PRO === '1' ? Object.keys(pro) : []);
		for (const [name, build] of Object.entries(registry).filter(([n]) => !n.startsWith('pro/')))
			expect(
				build().files.filter((f) => f.path.startsWith('pro/')),
				name
			).toEqual([]);
	});
	it('builds every Pro block in the private checkout', () => {
		for (const [name, build] of Object.entries(pro)) {
			const item = build();
			expect(
				item.files.some((f) => f.path.startsWith(`${name}/`)),
				name
			).toBe(true);
		}
	});
	it('installs every name the docs pages tell people to add', () => {
		const named = Object.entries(pages).flatMap(([path, src]) =>
			[...src.matchAll(/<Install names="([^"]+)"/g)].flatMap((m) =>
				m[1].split(' ').map((n) => [path, n] as const)
			)
		);
		expect(named.length).toBeGreaterThan(70);
		for (const [path, name] of named) expect(registry[name], `${path}: ${name}`).toBeDefined();
	});
});
