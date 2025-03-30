<script lang='ts'>
	import type { GeolocationCoords } from 'svelte-geolocation/Geolocation.svelte';
	import type { PageServerData } from './$types';
	import Geolocation from "svelte-geolocation";
	import Map from '../Map.svelte';
    import { get } from 'svelte/store';
	import { onMount } from 'svelte';


	let { data }: { data: PageServerData } = $props();

	
	let coords: GeolocationCoords = $state([50.07600, 14.4190]);

	let info = $state("nothing");


	function updatePosition() {
		info = "Loading...";

		if ('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition(
			(position: GeolocationPosition) => {
				console.log("updateSucess");
				coords = [position.coords.latitude, position.coords.longitude];	
				info = `La: ${position.coords.latitude.toFixed(4)},\n Lo: ${position.coords.longitude.toFixed(4)}`;
				

				// unlock rituals (rituals in distance 300m)
				// unlock areas (when on ritual)
				// collect seeds (from unlocked areas, and on seed)
				// update map


				coords = [50.7004203 - (Math.random()-0.5) * 0.06, 15.4772036 + (Math.random()-0.5) * 0.06];
			},
			(error: GeolocationPositionError) => {
				info = `Error, volej orgy.`;
			}
		);
		} else {
			info = "Geolocation is not supported.";
		}
	}

</script>

<Map myPos={coords} data={data} />

<div class="absolute bottom-0 left-0 p-4">
	<button onclick={() => (updatePosition())} class="bg-blue-500 rounded-lg text-white px-2 py-1 cursor-pointer">
		Update GPS <br>
		{info}
	</button>
</div>
