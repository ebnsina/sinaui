<script lang="ts">
	import * as Tabs from '#lib/ui/tabs/index.js';

	let by = $state('city');
</script>

<Tabs.Root bind:value={by} size="sm">
	<Tabs.List label="Loans by">
		<Tabs.Tab value="city">City</Tabs.Tab>
		<Tabs.Tab value="subject">Subject</Tabs.Tab>
		<Tabs.Tab value="language">Language</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="city">Baghdad 412, Córdoba 287, Cairo 196.</Tabs.Panel>
	<Tabs.Panel value="subject">Medicine 341, astronomy 302, mathematics 252.</Tabs.Panel>
	<Tabs.Panel value="language">Arabic 701, Persian 118, Greek 76.</Tabs.Panel>
</Tabs.Root>
