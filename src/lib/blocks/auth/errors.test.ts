import { describe, expect, it } from 'vitest';
import { toErrors, UserFacingError } from './errors';

describe('auth errors', () => {
	it('maps known codes; never shows the raw text of anything else', () => {
		expect(toErrors(Object.assign(new Error(), { code: 'email_taken' }))).toEqual({
			email: 'There’s already an account with this email.'
		});
		const generic = { form: 'Something went wrong. Try again.' };
		expect(toErrors(new Error('ECONNREFUSED 10.0.0.4:5432'))).toEqual(generic);
		// Looking like a user-facing error isn't enough: only the class opts in.
		expect(toErrors({ message: 'stack trace', fields: { email: 'x' }, userFacing: true })).toEqual(
			generic
		);
	});

	it('shows a UserFacingError word for word, by field', () => {
		expect(
			toErrors(new UserFacingError('Check the form.', { password: 'Use 12 characters or more.' }))
		).toEqual({ form: 'Check the form.', password: 'Use 12 characters or more.' });
		expect(toErrors(new UserFacingError('', { email: 'Taken.' }))).toEqual({
			email: 'Taken.',
			form: undefined
		});
	});
});
