import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ORIGIN: {},
	BETTER_AUTH_SECRET: {},
	KEYCLOAK_CLIENT_ID: {},
	KEYCLOAK_CLIENT_SECRET: {},
	KEYCLOAK_DISCOVERY_URL: {},
	DEFAULT_PROFILE: {}
});
