import { describe, expect, it } from 'vitest';
import { locate, type DocsSection } from './docs';

const sections: DocsSection[] = [
	{
		label: 'Guides',
		href: '/',
		groups: [
			{
				title: 'Start',
				items: [
					{ label: 'Intro', href: '/' },
					{ label: 'Setup', href: '/setup' }
				]
			}
		]
	},
	{ label: 'API', href: '/api', groups: [{ items: [{ label: 'Books', href: '/api' }] }] }
];

describe('locate', () => {
	it('finds the tab, group and the pages either side, across tabs', () => {
		const place = locate(sections, '/setup');
		expect(place.section.label).toBe('Guides');
		expect(place.group?.title).toBe('Start');
		expect(place.prev?.href).toBe('/');
		expect(place.next?.href).toBe('/api');
		expect(locate(sections, '/api').section.label).toBe('API');
	});
	it('has no previous page on the first, no next on the last', () => {
		expect(locate(sections, '/').prev).toBeUndefined();
		expect(locate(sections, '/api').next).toBeUndefined();
	});
	it('ignores a trailing slash', () => {
		expect(locate(sections, '/setup/').item?.label).toBe('Setup');
	});
	it('lands an unknown path on the first tab with no page', () => {
		const place = locate(sections, '/missing');
		expect(place.section.label).toBe('Guides');
		expect(place.item).toBeUndefined();
	});
	it('errors without sections', () => {
		expect(() => locate([], '/')).toThrow('at least one section');
	});
});
