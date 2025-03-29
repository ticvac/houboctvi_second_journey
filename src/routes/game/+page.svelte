<script lang='ts'>
	import type { GeolocationCoords } from 'svelte-geolocation/Geolocation.svelte';
	import type { PageServerData } from './$types';
	import Map from '../Map.svelte';

	let { data }: { data: PageServerData } = $props();


	let coords:GeolocationCoords = [50.07600, 14.4190]; // TODO

</script>


<Map myPos={coords} data={data} />