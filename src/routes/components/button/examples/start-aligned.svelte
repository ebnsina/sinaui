<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { ArrowDown01Icon, Folder01Icon } from '@hugeicons/core-free-icons';
</script>

<div style:inline-size="min(100%, 16rem)">
	<Button variant="outline" align="start" style="inline-size: 100%">
		<Icon icon={Folder01Icon} /> Manuscripts <Icon icon={ArrowDown01Icon} />
	</Button>
</div>
