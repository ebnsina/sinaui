// The docs' accent choice: which tokens.css preset is on <html>. Monochrome sets none.
export const accents = [
	{ value: 'mono', label: 'Monochrome' },
	{ value: 'blue', label: 'Blue' },
	{ value: 'orange', label: 'Orange' },
	{ value: 'lime', label: 'Lime' },
	{ value: 'emerald', label: 'Emerald' },
	{ value: 'pink', label: 'Pink' },
	{ value: 'sky', label: 'Sky' }
] as const;

export type Accent = (typeof accents)[number]['value'];

export const currentAccent = (): Accent =>
	(document.documentElement.dataset.accent as Accent | undefined) ?? 'mono';

export function setAccent(accent: Accent) {
	const root = document.documentElement;
	if (accent === 'mono') delete root.dataset.accent;
	else root.dataset.accent = accent;
	try {
		localStorage.setItem('accent', accent);
	} catch {
		// Private mode or blocked storage: the choice just won't persist.
	}
}
