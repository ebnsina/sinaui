<script lang="ts">
	import DocsNav from '#lib/ui/DocsNav.svelte';

	// This page's own sections, so every link goes somewhere.
	const groups = [
		{
			title: 'Get started',
			items: [
				{ label: 'Installation', href: '#installation' },
				{ label: 'Examples', href: '#examples', badge: 'New' }
			]
		},
		{
			title: 'Reference',
			items: [
				{ label: 'Props', href: '#props' },
				{ label: 'Accessibility', href: '#accessibility' }
			]
		}
	];
	let current = $state('#examples');
</script>

<div class="frame">
	<DocsNav label="This page" {groups} {current} onselect={(item) => (current = item.href)} />
</div>

<style>
	.frame {
		inline-size: min(15rem, 100%);
	}
</style>
