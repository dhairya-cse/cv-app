<script lang="ts">
	import type { Cv } from '#lib/types/cv-schema.ts';

	let { cv }: { cv: Cv } = $props();
</script>

<p>
	{JSON.stringify(cv, null, 2)}
</p>