<script lang="ts">
	import Toc from '#lib/ui/Toc.svelte';

	// This page's own sections: scroll it and the highlight follows.
	const items = [
		{ id: 'installation', label: 'Installation' },
		{ id: 'examples', label: 'Examples' },
		{ id: 'props', label: 'Props' },
		{ id: 'accessibility', label: 'Accessibility' }
	];
</script>

<Toc {items} offset={64} />
