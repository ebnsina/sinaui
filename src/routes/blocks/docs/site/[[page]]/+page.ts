import { error } from '@sveltejs/kit';
import { find, pages } from '../content.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => pages.map((p) => ({ page: p.slug }));

export const load: PageLoad = ({ params }) => {
	const doc = find(params.page ?? '');
	if (!doc) error(404, 'There is no such page in these docs.');
	return { slug: doc.slug };
};
