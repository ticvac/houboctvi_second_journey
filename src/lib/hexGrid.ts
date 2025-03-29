// src/lib/hexGrid.ts

/**
 * Generates a set of points in a hexagonal spiral around a center.
 * @param centerLat Latitude of the center point.
 * @param centerLon Longitude of the center point.
 * @param rings Number of hexagonal rings to generate.
 * @returns An array of [lat, lon] points.
 */
export function generateHexSpiralPoints(centerLat: number, centerLon: number, rings: number, distance: number): [number, number][] {
    const points: [number, number][] = [];
    
    // Distance between centers in meters.
    const a = distance;
    
    // Conversion factors: approximate meters per degree.
    const metersPerDegLat = 111320;
    // Use center latitude for longitude conversion approximation.
    const metersPerDegLon = 111320 * Math.cos(centerLat * Math.PI / 180);
    
    // Helper to convert axial coordinates to [x,y] in meters then to lat/lon.
    function axialToLatLon(q: number, r: number): [number, number] {
      const x = a * Math.sqrt(3) * (q + r / 2);
      const y = a * (3 / 2) * r;
      const lat = centerLat + (y / metersPerDegLat);
      const lon = centerLon + (x / metersPerDegLon);
      return [lat, lon];
    }
    
    // Add center point.
    points.push([centerLat, centerLon]);
    
    // Axial directions for a pointy-topped hex grid.
    const directions: [number, number][] = [
      [1, 0],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [0, -1],
      [1, -1],
    ];
    
    // Generate hexagonal spiral points by rings.
    for (let ring = 1; ring <= rings; ring++) {
      let q = 0;
      let r = -ring;
      for (let side = 0; side < 6; side++) {
        const [dq, dr] = directions[side];
        for (let step = 0; step < ring; step++) {
          points.push(axialToLatLon(q, r));
          q += dq;
          r += dr;
        }
      }
    }
    
    return points;
}