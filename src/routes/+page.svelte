<script lang="ts">
    import type { GeolocationCoords } from "svelte-geolocation/Geolocation.svelte";
    import Map from "./Map.svelte";
    import Geolocation from "svelte-geolocation";

    let getPosition = false;

    let coords:GeolocationCoords = [50.07600, 14.4190];
    $: {
        console.log(coords);
        coords[1] += 1;
        console.log(coords);
        getPosition = false;
        // set coords to random location from initial +- 1000m
        console.log("RANDOM");
        coords = [50.07600 - Math.random() * 0.06, 14.4190 + Math.random() * 0.06];
    };

</script>


<div class="absolute bottom-0 left-0 p-4 text-white bg-blue-500 m-4 rounded-lg">

    <button on:click={() => (getPosition = true)}> Get geolocation </button>

    <Geolocation
        {getPosition}
        bind:coords
        let:loading
        let:success
        let:error
        let:notSupported
    >
        {#if notSupported}
            Your browser does not support the Geolocation API.
        {:else}
            {#if loading}
            Loading...
            {/if}
            {#if success}
            {JSON.stringify(coords)}
            {/if}
            {#if error}
            An error occurred. {error.code} {error.message}
            {/if}
        {/if}
    </Geolocation>
</div>
        

