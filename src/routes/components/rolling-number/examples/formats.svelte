<script lang="ts">
	import Segmented from '#lib/ui/Segmented.svelte';
	import RollingNumber from '#lib/ui/RollingNumber.svelte';

	// Any Intl.NumberFormat style rolls: currency, percent, units.
	const plans = { month: { price: 9, saved: 0 }, year: { price: 90, saved: 0.17 } };
	let plan = $state<'month' | 'year'>('month');
</script>

<div class="price">
	<Segmented
		label="Billing"
		hideLabel
		options={[
			{ value: 'month', label: 'Monthly' },
			{ value: 'year', label: 'Yearly' }
		]}
		bind:value={() => plan, (v) => (plan = v as typeof plan)}
	/>
	<span class="n">
		<RollingNumber
			value={plans[plan].price}
			format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
		/>
	</span>
	<!-- Only yearly saves anything: monthly keeps the line's space but hides it, so nothing jumps. -->
	<span class="save" class:none={!plans[plan].saved} aria-hidden={!plans[plan].saved}>
		Save <RollingNumber value={plans[plan].saved} format={{ style: 'percent' }} />
	</span>
</div>

<style>
	.price {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
	}
	.n {
		font: 600 2.5rem/1 var(--ui-font);
	}
	.save {
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	.save {
		transition: opacity var(--ui-dur) ease;
	}
	.none {
		opacity: 0;
	}
</style>
