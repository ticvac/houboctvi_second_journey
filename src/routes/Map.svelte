<script lang="ts">
  const { rituals, areas, seeds, myPos } = $props();

//   const { areas } = data;
//   const { rituals } = data;
//   const { seeds } = data; 



  import { generateHexSpiralPoints } from '$lib/hexGrid';
  import { onMount } from "svelte";
  import type { GeolocationCoords } from "svelte-geolocation/Geolocation.svelte";
  import { generateRandomPoints } from '$lib/randomPoints';
  import { generateMultipleRandomPoints } from '$lib/multipleRandomPoints';
  
  var mapMarker: L.Marker;
  var map: L.Map;
  let location: [number, number] = [50.7004203, 15.4772036];


  let letMapAreas: L.Circle[] = [];
  let letMapRituals: L.Circle[] = [];
  let letMapSeeds: L.Circle[] = [];

  
  $effect(() => {
    console.log('myPosaaaa:', myPos);
    updateMarker();
  });
  


  function updateMarker() {
    if (!mapMarker) return;
    // set myPos to random location from initial +- 1000m
    mapMarker.setLatLng(myPos);
    // console.log("marker updated")
    map.setView(myPos, 16);
    updateThings();
  }

  function updateThings() {
    console.log("rituals_len", rituals.length);


    // remove all circles from map
    letMapAreas.forEach((circle: L.Circle) => {
        map!.removeLayer(circle);
    });
    letMapRituals.forEach((circle: L.Circle) => {
        map!.removeLayer(circle);
    });
    letMapSeeds.forEach((circle: L.Circle) => {
        map!.removeLayer(circle);
    });
    letMapAreas = [];
    letMapRituals = [];
    letMapSeeds = [];

    areas.forEach((area: Area) => {
        var circle = L.circle([area.lat, area.lon], {
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.1,
            weight: 0.5,
            radius: 160
        }).addTo(map!);
        letMapAreas.push(circle);
    });

    rituals.forEach((ritual:Ritual) => {
        var circle = L.circle([ritual.lat, ritual.lon], {
            color: 'red',
            fillColor: 'red',
            fillOpacity: 1,
            weight: 1,
            radius: 5
        }).addTo(map!);
        letMapRituals.push(circle);
    });

    seeds.forEach((seed: Seed) => {
        var circle = L.circle([seed.lat, seed.lon], {
            color: 'yellow',
            fillColor: 'yellow',
            fillOpacity: 1,
            weight: 1,
            radius: 5
        }).addTo(map!);
        letMapSeeds.push(circle);
  }); 

  }
  



  
    import type { Area, Ritual, Seed } from '$lib/server/db/schema';
  onMount(async () => {
    
    const leafletModule = await import('leaflet');
    let L = leafletModule.default;
    map = L.map("map").setView(myPos, 16);
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

    mapMarker = L.marker(myPos).addTo(map!);
    updateThings();

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
  
<div id="map" class="absolute z-[-10] h-dvh w-dvw"></div>