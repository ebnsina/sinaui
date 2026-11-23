<script lang="ts">
	import Dashboard, { type DashboardData } from '#lib/blocks/dashboard/Dashboard.svelte';
	import { toast } from '#lib/ui/toast/index.js';

	// Demo numbers for each period; in your app, load them when the range changes.
	const periods: Record<string, { labels: string[]; scale: number }> = {
		'7d': { labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'], scale: 1 },
		'30d': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], scale: 4.3 },
		'12m': {
			labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
			scale: 52
		}
	};
	const wave = (i: number, seed: number) =>
		1 + 0.18 * Math.sin(i * 1.3 + seed) + 0.06 * Math.cos(i * 2.7);

	function load(range: string): DashboardData {
		const { labels, scale } = periods[range];
		const per = (scale * 420) / labels.length;
		// Each number's path across the period, for the small line under it.
		const path = (total: number, seed: number) =>
			labels.map((_, i) => Math.round((total / labels.length) * wave(i, seed)));
		return {
			stats: [
				{
					label: 'Loans',
					value: Math.round(scale * 420),
					change: 0.124,
					trend: path(scale * 420, 0.4)
				},
				{
					label: 'New members',
					value: Math.round(scale * 36),
					change: 0.061,
					trend: path(scale * 36, 1.1)
				},
				{
					label: 'Visits',
					value: Math.round(scale * 1880),
					change: -0.032,
					trend: path(scale * 1880, 2.3)
				},
				{
					label: 'Overdue',
					value: Math.round(scale * 14),
					change: 0.08,
					goodWhen: 'down',
					trend: path(scale * 14, 3.1)
				}
			],
			trend: labels.map((label, i) => ({
				label,
				current: Math.round(per * wave(i, 0.4)),
				previous: Math.round(per * 0.88 * wave(i, 1.9))
			})),
			subjects: [
				{ subject: 'Medicine', count: Math.round(scale * 150) },
				{ subject: 'Astronomy', count: Math.round(scale * 96) },
				{ subject: 'Mathematics', count: Math.round(scale * 88) },
				{ subject: 'Philosophy', count: Math.round(scale * 54) },
				{ subject: 'Geography', count: Math.round(scale * 32) }
			],
			rooms: [
				{ name: 'Main hall', used: 38, seats: 60 },
				{ name: 'Manuscripts room', used: 21, seats: 24 },
				{ name: 'Observatory', used: 5, seats: 16 }
			],
			loans: [
				{
					id: '1',
					title: 'The Canon of Medicine',
					reader: 'Maryam al-Ijliya',
					due: '3 Oct',
					status: 'Due soon'
				},
				{
					id: '2',
					title: 'Book of Optics',
					reader: 'Thābit ibn Qurra',
					due: '28 Sep',
					status: 'Overdue'
				},
				{
					id: '3',
					title: 'The Compendious Book on Calculation',
					reader: 'Ibn Sīnā',
					due: '12 Oct',
					status: 'On time'
				},
				{
					id: '4',
					title: 'Book of Fixed Stars',
					reader: 'Fāṭima al-Fihrī',
					due: '15 Oct',
					status: 'On time'
				},
				{
					id: '5',
					title: 'Tabula Rogeriana',
					reader: 'Al-Bīrūnī',
					due: '1 Oct',
					status: 'Due soon'
				},
				{
					id: '6',
					title: 'Book of Ingenious Devices',
					reader: 'Banu Musa',
					due: '20 Oct',
					status: 'On time'
				},
				{ id: '7', title: 'Kitāb al-Taṣrīf', reader: 'Al-Kindī', due: '26 Sep', status: 'Overdue' }
			],
			readers: [
				{ name: 'Al-Bīrūnī', loans: Math.round(scale * 9) },
				{ name: 'Fāṭima al-Fihrī', loans: Math.round(scale * 7) },
				{ name: 'Ibn Sīnā', loans: Math.round(scale * 6) },
				{ name: 'Maryam al-Ijliya', loans: Math.round(scale * 4) },
				{ name: 'Thābit ibn Qurra', loans: Math.round(scale * 3) }
			],
			activity: [
				{ who: 'Maryam al-Ijliya', what: 'asked for a reading card', when: '12 min ago' },
				{ who: 'Al-Bīrūnī', what: 'borrowed Tabula Rogeriana', when: '40 min ago' },
				{ who: 'Thābit ibn Qurra', what: 'is 3 days late with Book of Optics', when: '1 h ago' },
				{ who: 'Ibn Sīnā', what: 'returned The Canon of Medicine', when: '2 h ago' },
				{ who: 'Fāṭima al-Fihrī', what: 'booked the Manuscripts room', when: 'Yesterday' }
			]
		};
	}

	let range = $state('30d');
	const data = $derived(load(range));
</script>

<Dashboard
	{data}
	bind:range
	title="Overview"
	onexport={() => toast.success('The report is on its way to your email.')}
/>
