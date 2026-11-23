<script lang="ts">
	import Carousel from '#lib/ui/Carousel.svelte';

	const treasures = [
		{ title: 'The Canon of Medicine', by: 'Ibn Sīnā', year: 1025, shade: 0.34 },
		{ title: 'Book of Optics', by: 'Ibn al-Haytham', year: 1021, shade: 0.28 },
		{ title: 'Al-Jabr', by: 'Al-Khwārizmī', year: 820, shade: 0.4 },
		{ title: 'Tabula Rogeriana', by: 'Al-Idrīsī', year: 1154, shade: 0.24 },
		{ title: 'Book of Ingenious Devices', by: 'Al-Jazarī', year: 1206, shade: 0.31 }
	];
</script>

<div class="wrap">
	<Carousel label="Treasures of the House of Wisdom" slides={treasures}>
		{#snippet slide(t)}
			<article class="card" style:--shade={t.shade}>
				<span class="year">{t.year}</span>
				<h4>{t.title}</h4>
				<p>{t.by}</p>
				<a href="#basic">View manuscript</a>
			</article>
		{/snippet}
	</Carousel>
</div>

<style>
	.wrap {
		inline-size: min(100%, 30rem);
	}
	.card {
		display: grid;
		align-content: end;
		gap: 0.125rem;
		aspect-ratio: 16 / 10;
		padding: 1.25rem;
		box-sizing: border-box;
		border-radius: var(--ui-radius);
		background: linear-gradient(
			145deg,
			oklch(var(--shade) 0 0),
			oklch(calc(var(--shade) - 0.14) 0 0)
		);
		color: #fff;
	}
	.year {
		font-variant-numeric: tabular-nums;
		opacity: 0.8;
	}
	h4 {
		margin: 0;
		font-size: 1.25rem;
	}
	p {
		margin: 0 0 0.5rem;
		opacity: 0.85;
	}
	a {
		color: #fff;
		font-weight: 500;
	}
</style>
