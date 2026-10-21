<script lang="ts">
	import SignUp from '#lib/blocks/auth/SignUp.svelte';
	import { UserFacingError } from '#lib/blocks/auth/errors.js';

	// Stands in for an API that owns the password rule and words its own errors for people.
	async function signUp({ password }: { name: string; email: string; password: string }) {
		await new Promise((r) => setTimeout(r, 600));
		if (password.length < 12)
			throw new UserFacingError('Check the password, then try again.', {
				password: 'Use 12 characters or more.'
			});
	}
</script>

<SignUp
	onsubmit={signUp}
	minLength={0}
	title="Join the reading room"
	description="Your card works in every branch."
/>
