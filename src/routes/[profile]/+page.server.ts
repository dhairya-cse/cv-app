import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '#lib/server/auth.ts';

export const load: PageServerLoad = (event) => {
	return { user: event.locals.user, post: event.params.profile };
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, event.url.pathname);
	},
	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'keycloak';
		const callbackURL = formData.get('callbackURL')?.toString() ?? event.url.pathname;

		const result = await auth.api.signInSocial({
			body: {
				provider: provider as 'keycloak',
				callbackURL
			}
		});

		if (result.url) {
			return redirect(302, result.url, { external: true });
		}
		return fail(400, { message: 'Social sign-in failed' });
	}
};
