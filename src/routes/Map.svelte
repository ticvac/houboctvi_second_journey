<script lang="ts">
  import { generateHexSpiralPoints } from '$lib/hexGrid';
  import { onMount } from "svelte";
  import type { GeolocationCoords } from "svelte-geolocation/Geolocation.svelte";
  import { generateRandomPoints } from '$lib/randomPoints';

  export let myPos:GeolocationCoords;


  // let location = [50.7004203, 15.4772036];
  let location: [number, number] = [50.07600, 14.4190];

  let centerLat = location[0];
  let centerLng = location[1];
  let spiral = generateHexSpiralPoints(centerLat, centerLng, 15);

  let radius = 100;
  const randomPoints = generateRandomPoints(spiral, radius);

  import type { Map } from 'leaflet';
  let map: Map | null = null;
  onMount(async () => {
  
    const leafletModule = await import('leaflet');
    let L = leafletModule.default;
    map = L.map("map").setView(location, 16);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 20,
            attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map!);

    var circle = L.circle(location, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.5,
        radius: 50
    }).addTo(map);

    spiral.forEach((point) => {
        var circle = L.circle(point, {
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.1,
            weight: 0.5,
            radius: radius
        }).addTo(map!);
    });

    randomPoints.forEach((point) => {
        var circle = L.circle(point, {
            color: 'red',
            fillColor: 'red',
            fillOpacity: 1,
            weight: 1,
            radius: 5
        }).addTo(map!);
    });
  });
</script>


<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""/>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
     integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
     crossorigin=""></script>
</svelte:head>
  
<div id="map" class="absolute z-[-10] h-dvh w-dvw"/>