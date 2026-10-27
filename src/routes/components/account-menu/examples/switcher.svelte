<script lang="ts">
	import { Settings01Icon } from '@hugeicons/core-free-icons';
	import AccountMenu from '#lib/ui/AccountMenu.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';
	import { toast } from '#lib/ui/toast/index.js';

	const orgs = [
		{ id: 'baghdad', name: 'House of Wisdom, Baghdad' },
		{ id: 'cordoba', name: 'Library of Córdoba' },
		{ id: 'fez', name: 'Al-Qarawiyyin, Fez' }
	];
	let org = $state('baghdad');
</script>

<AccountMenu
	user={{ name: 'Fatima al-Fihri', email: 'fatima@qarawiyyin.example' }}
	{orgs}
	{org}
	onorg={(o) => {
		org = o.id;
		toast(`Switched to ${o.name}.`);
	}}
	onneworg={() => toast('A new organization would be created here.')}
	onsignout={() => toast('Signed out.')}
	theme
>
	<Dropdown.Item onselect={() => toast('Account settings would open here.')}>
		<Icon icon={Settings01Icon} /> Account settings
	</Dropdown.Item>
</AccountMenu>
