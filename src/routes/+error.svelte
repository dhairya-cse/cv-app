<script lang="ts">
	let { error } = $props();
</script>

<svelte:head>
	<title>{error.message}</title>
	<meta name="description" content={error.message} />
</svelte:head>

<p>{error.message}</p>
