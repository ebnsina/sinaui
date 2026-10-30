<script lang="ts">
	import * as Tabs from '#lib/ui/tabs/index.js';
</script>

<!-- fit: the area takes the chosen panel's height, so a short panel leaves no gap below it. -->
<Tabs.Root fit>
	<Tabs.List label="Lending rules">
		<Tabs.Tab value="short">In brief</Tabs.Tab>
		<Tabs.Tab value="full">In full</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="short">
		<p>Two manuscripts at a time, for up to four weeks.</p>
	</Tabs.Panel>
	<Tabs.Panel value="full">
		<p>Readers may borrow two manuscripts at a time, for up to four weeks each.</p>
		<p>Rare copies stay in the reading room of the House of Wisdom and can't leave it.</p>
		<p>
			Renew once by asking the librarian before the due date; a copy someone else has asked for
			can't be renewed.
		</p>
	</Tabs.Panel>
</Tabs.Root>
