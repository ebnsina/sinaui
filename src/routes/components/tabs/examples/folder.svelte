<script lang="ts">
	import * as Tabs from '#lib/ui/tabs/index.js';

	let city = $state('baghdad');
</script>

<Tabs.Root bind:value={city} variant="folder">
	<Tabs.List label="Houses of learning">
		<Tabs.Tab value="baghdad">Baghdad</Tabs.Tab>
		<Tabs.Tab value="cordoba">Córdoba</Tabs.Tab>
		<Tabs.Tab value="fez">Fez</Tabs.Tab>
		<Tabs.Tab value="samarkand">Samarkand</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="baghdad"
		>The House of Wisdom gathered translators of Greek, Persian and Sanskrit.</Tabs.Panel
	>
	<Tabs.Panel value="cordoba">Its library held some four hundred thousand volumes.</Tabs.Panel>
	<Tabs.Panel value="fez">Al-Qarawiyyin, founded in 859, still awards degrees.</Tabs.Panel>
	<Tabs.Panel value="samarkand">Ulugh Beg's observatory charted over a thousand stars.</Tabs.Panel>
</Tabs.Root>
