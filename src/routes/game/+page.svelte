<script lang='ts'>
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>


<h1>Game</h1>
<div>{data}</div>