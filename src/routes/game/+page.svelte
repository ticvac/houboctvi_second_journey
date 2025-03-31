<script lang='ts'>
	import type { GeolocationCoords } from 'svelte-geolocation/Geolocation.svelte';
	import type { PageServerData } from './$types';
	import Geolocation from "svelte-geolocation";
	import Map from '../Map.svelte';
    import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit'


	let { data }: { data: PageServerData } = $props();

	
	let coords: GeolocationCoords = $state([50.07600, 14.4190]);

	let updatedRituals = $state(data.rituals);
	let updatedAreas = $state(data.areas);
	let updatedSeeds = $state(data.seeds);

	let totalSeedsCollected = $state(data.seedsCollected);

	let info = $state("nothing");


	function updatePosition() {
		info = "Loading...";

		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position: GeolocationPosition) => {
					console.log("updateSucess");
					coords = [position.coords.latitude, position.coords.longitude];
					// move coords randonly by 1000m
					coords = [coords[0] + (Math.random()-0.5) * 0.15, coords[1] + (Math.random()-0.5) * 0.15];
					
					
					// unlock rituals (rituals in distance 300m)
					// unlock areas (when on ritual)
					// collect seeds (from unlocked areas, and on seed)
					// update map


					// coords = [50.7004203 - (Math.random()-0.5) * 0.06, 15.4772036 + (Math.random()-0.5) * 0.06];
					info = `La: ${coords[0].toFixed(4)},\n Lo: ${coords[1].toFixed(4)}`;
					
					let form = document.querySelector('form');
					form?.querySelector('input[name="lat"]')?.setAttribute('value', coords[0].toString());
					form?.querySelector('input[name="lon"]')?.setAttribute('value', coords[1].toString());

					form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
					
				},
				(error: GeolocationPositionError) => {
					info = `Error, volej orgy.`;
				},
				{ enableHighAccuracy: true, timeout:  100000, maximumAge: 0 }
			);
		} else {
			info = "Geolocation is not supported.";
		}
		
	}


	async function handleSubmit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement}) {

		event.preventDefault();

		const dataF = new FormData(event.currentTarget);

		const response = await fetch(event.currentTarget.action, {
		method: 'POST',
		body: dataF
		});
		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			// rerun all `load` functions, following the successful update
			await invalidateAll();
			console.log("success");
			console.log(result);
			updatedRituals = (result.data!.rituals);
			updatedAreas = (result.data!.areas);
			updatedSeeds = (result.data!.seeds);
			totalSeedsCollected = (result.data!.seedsCollected);
		}

		applyAction(result);
	}

</script>

<Map myPos={coords} rituals={updatedRituals} seeds={updatedSeeds} areas={updatedAreas} />

<div class="absolute bottom-0 left-0 p-4">
	<form method="post" action="?/positionUpdate" onsubmit={handleSubmit}>
		<input type="hidden" name="lat" value={coords[0]} />
		<input type="hidden" name="lon" value={coords[1]} />
		<button type="button" onclick={updatePosition} class="bg-blue-500 rounded-lg text-white px-2 py-1 cursor-pointer">
			Update GPS <br>
			{info}
		</button>
	</form>
</div>

<a href="game/almanach" class="absolute bottom-0 right-0 p-4 text-white bg-yellow-500 m-4 rounded-lg">
	{totalSeedsCollected}
</a>

<div class="absolute top-0 right-0 p-4">
	<form method="post" action="?/resetUserProgress">
		<button type="submit" class="bg-red-500 rounded-lg text-white px-2 py-1 cursor-pointer">
			Reset User Progress
		</button>
	</form>
</div>
