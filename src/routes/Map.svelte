<script lang="ts">
    import Geolocation from "svelte-geolocation";

    import { onMount } from "svelte";
    import type { GeolocationCoords } from "svelte-geolocation/Geolocation.svelte";

    export let myPos:GeolocationCoords;


    // let location = [50.7004203, 15.4772036];
    let location = [50.07600, 14.4190]
    
    let map = null;
    onMount(async () => {
    
        const leafletModule = await import('leaflet');
        let L = leafletModule.default;
        map = L.map("map").setView(location, 16);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 20,
                attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        var circle = L.circle(location, {
            color: 'green',
            fillColor: 'green',
            fillOpacity: 0.5,
            radius: 50
        }).addTo(map);

        var mark = L.marker(myPos).addTo(map);
        mark.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

        

// Hexagon and grid parameters
const hexagonRadius: number = 300; // Distance from center to vertex in meters
const spacing: number = 10; // Extra gap between hexagon centers, in meters
const cols: number = 20;
const rows: number = 20;

// For a pointy-topped hexagon grid the ideal center-to-center distances are:
// Horizontal: hexagonRadius * sqrt(3)
// Vertical: hexagonRadius * 1.5
// Adding spacing to each dimension:
const horizontalSpacing: number = hexagonRadius * Math.sqrt(3) + spacing;
const verticalSpacing: number = (hexagonRadius * 2) + spacing;

// Starting point (grid origin)
const startLat: number = location[0];
const startLng: number = location[1];

/**
 * Compute a destination point given a start coordinate, a distance in meters,
 * and a bearing (in degrees) using a spherical Earth approximation.
 */
function destinationPoint(lat: number, lng: number, distance: number, bearing: number): [number, number] {
  const R: number = 6378137; // Earth's radius in meters
  const brng = bearing * Math.PI / 180;
  const lat1 = lat * Math.PI / 180;
  const lng1 = lng * Math.PI / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) +
                         Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng));
  const lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
                                 Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
  return [lat2 * 180 / Math.PI, lng2 * 180 / Math.PI];
}

/**
 * Given a center coordinate, compute the vertices for a pointy-topped hexagon.
 * Here, we start with a top vertex at 90° and compute vertices every 60°.
 */
function computeHexagonVertices(center: [number, number], radius: number): [number, number][] {
  const vertices: [number, number][] = [];
  const startAngle = 90; // Top vertex at 90°
  for (let i = 0; i < 6; i++) {
    const angle = startAngle + i * 60;
    vertices.push(destinationPoint(center[0], center[1], radius, angle));
  }
  return vertices;
}

// Create the hexagon grid
for (let col = 0; col < cols; col++) {
  for (let row = 0; row < rows; row++) {
    // Determine the center for this hexagon:
    // 1. From the origin, move east by col * horizontalSpacing
    let center: [number, number] = destinationPoint(startLat, startLng, col * horizontalSpacing, 90);
    // 2. For the vertical placement, move south by row * verticalSpacing.
    // For odd-numbered columns, add an extra half vertical offset.
    const extraOffset: number = (col % 2 !== 0) ? verticalSpacing / 2 : 0;
    center = destinationPoint(center[0], center[1], row * verticalSpacing + extraOffset, 180);

    // Compute the six vertices of the hexagon based on its center
    const hexagon: [number, number][] = computeHexagonVertices(center, hexagonRadius);

    // Draw the hexagon on the Leaflet map
    L.polygon(hexagon, { color: "red", weight: 0.1 }).addTo(map);
  }
}





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