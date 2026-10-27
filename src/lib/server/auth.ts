import {
	ORIGIN,
	BETTER_AUTH_SECRET,
	KEYCLOAK_CLIENT_ID,
	KEYCLOAK_CLIENT_SECRET,
	KEYCLOAK_DISCOVERY_URL
} from '$app/env/private';

import { betterAuth } from 'better-auth/minimal';
import { genericOAuth } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	user: {
		additionalFields: {
			preferred_username: {
				type: 'string',
				required: true,
				defaultValue: null,
				input: true
			}
		}
	},
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: 'keycloak',
					clientId: KEYCLOAK_CLIENT_ID,
					clientSecret: KEYCLOAK_CLIENT_SECRET,
					discoveryUrl: KEYCLOAK_DISCOVERY_URL,
					scopes: ['openid', 'profile', 'email'],
					pkce: true,
					redirectURI: `${ORIGIN}/api/auth/callback/keycloak`,
					mapProfileToUser: (profile) => {
						return {
							preferred_username: profile.preferred_username
						};
					}
				}
			]
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
