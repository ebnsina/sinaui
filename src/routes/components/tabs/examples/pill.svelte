<script lang="ts">
	import * as Tabs from '#lib/ui/tabs/index.js';

	let range = $state('day');
</script>

<Tabs.Root bind:value={range} variant="pill">
	<Tabs.List label="Prayer times">
		<Tabs.Tab value="day">Day</Tabs.Tab>
		<Tabs.Tab value="week">Week</Tabs.Tab>
		<Tabs.Tab value="month">Month</Tabs.Tab>
		<Tabs.Tab value="ramadan">Ramadan</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="day">Fajr 4:52, Dhuhr 11:58, Asr 3:41, Maghrib 5:22, Isha 6:37.</Tabs.Panel>
	<Tabs.Panel value="week">Maghrib moves about four minutes earlier this week.</Tabs.Panel>
	<Tabs.Panel value="month">Fajr shifts from 4:52 to 5:08 over the month.</Tabs.Panel>
	<Tabs.Panel value="ramadan">Suhoor ends at the start of Fajr; iftar is at Maghrib.</Tabs.Panel>
</Tabs.Root>
