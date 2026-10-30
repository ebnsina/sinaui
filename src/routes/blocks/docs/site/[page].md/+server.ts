import { error } from '@sveltejs/kit';
import { find, markdown, pages } from '../content.js';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => pages.map((p) => ({ page: p.slug || 'index' }));

export const GET: RequestHandler = ({ params }) => {
	const doc = find(params.page === 'index' ? '' : params.page);
	if (!doc) error(404, 'There is no such page in these docs.');
	return new Response(markdown(doc), {
		headers: { 'content-type': 'text/markdown; charset=utf-8' }
	});
};
