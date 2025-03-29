// src/lib/randomPoint.ts

/**
 * Generates a random point within a circle of the given radius around the provided center.
 * @param centerLat The latitude of the center point.
 * @param centerLon The longitude of the center point.
 * @param radius The radius in meters within which the random point should be generated.
 * @returns A random [lat, lon] point within the specified radius.
 */
export function generateRandomPoint(centerLat: number, centerLon: number, radius: number): [number, number] {
    // Generate a random angle between 0 and 2π.
    const angle = Math.random() * 2 * Math.PI;
    // Generate a random distance with uniform distribution over the area.
    const distance = Math.sqrt(Math.random()) * radius;
    
    // Calculate offsets in meters.
    const dx = distance * Math.cos(angle);
    const dy = distance * Math.sin(angle);
    
    // Conversion factors: approximate meters per degree.
    const metersPerDegLat = 111320;
    // For longitude, adjust for latitude.
    const metersPerDegLon = 111320 * Math.cos(centerLat * Math.PI / 180);
    
    // Convert meter offsets to degrees.
    const dLat = dy / metersPerDegLat;
    const dLon = dx / metersPerDegLon;
    
    return [centerLat + dLat, centerLon + dLon];
  }
  
  /**
   * For each provided point, generates one random point within the specified radius.
   * @param points Array of [lat, lon] points around which random points are generated.
   * @param radius The radius in meters for generating the random points.
   * @returns An array of random [lat, lon] points.
   */
  export function generateRandomPoints(points: [number, number][], radius: number): [number, number][] {
    return points.map(([lat, lon]) => generateRandomPoint(lat, lon, radius));
  }
  