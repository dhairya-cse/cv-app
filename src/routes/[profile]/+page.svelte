<script lang="ts">
	import { enhance } from '$app/forms';

	import type { PageServerData } from './$types';
	let { data }: { data: PageServerData } = $props();
</script>


<p>Your are now viewing profile of {data.post}</p>

{#if data.user}
	<h1>Hi, {data.user.name}!</h1>
	<p>Your user ID is {data.user.email}.</p>	
	<form method="POST" use:enhance action="?/signOut">
  		<button>Just Sign out</button>
	</form>
{:else}
	<h1>Hello Mr. Unknown</h1>
	<form method="POST" use:enhance action="?/signInSocial">
  		<button>Continue with Keycloak</button>
	</form>
{/if}