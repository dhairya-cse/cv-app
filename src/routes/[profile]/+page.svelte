<script lang="ts">
	import Resume from '#lib/components/Resume.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<Resume cv={data.cv} config={data.config}></Resume>