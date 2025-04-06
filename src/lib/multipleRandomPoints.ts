// src/lib/multipleRandomPoints.ts

import { generateRandomPoint } from './randomPoints';

/**
 * Options for generating multiple random points.
 */
export interface MultipleRandomPointsOptions {
  /**
   * The base number of random points generated for each input point.
   * @default 1
   */
  baseCount?: number;
  /**
   * How many additional points per meter of distance from the center.
   * (e.g., if 0.005, then for every 200m from the center, ~1 extra point on average)
   * @default 0.005
   */
  distanceMultiplier?: number;
  /**
   * A random spread factor: points count will be multiplied by a factor between
   * 1 - randomSpread and 1 + randomSpread. For example, if randomSpread is 0.5,
   * then the count is varied between 50% and 150% of the expected count.
   * @default 0.5
   */
  randomSpread?: number;
}

/**
 * Generates multiple random points within a given radius for each input point.
 * The number of random points is random and increases with the distance from the provided center.
 *
 * @param points Array of [lat, lon] points for which to generate random points.
 * @param radius The radius (in meters) within which to generate each random point.
 * @param center The central reference point [lat, lon] used to determine the distance.
 * @param options Optional parameters to adjust point count constants.
 * @returns An array where each element is an array of random [lat, lon] points for the corresponding input point.
 */
export function generateMultipleRandomPoints(
  points: [number, number][],
  radius: number,
  center: [number, number],
  options?: MultipleRandomPointsOptions
): [number, number][][] {
  const { baseCount = 1, distanceMultiplier = 0.005, randomSpread = 0.5 } = options || {};

  // Conversion factors (approximate)
  const metersPerDegLat = 111320;
  const metersPerDegLon = 111320 * Math.cos(center[0] * Math.PI / 180);

  /**
   * Computes approximate distance in meters between two lat/lon points using a simple conversion.
   */
  function distanceFromCenter([lat, lon]: [number, number]): number {
    const dLat = (lat - center[0]) * metersPerDegLat;
    const dLon = (lon - center[1]) * metersPerDegLon;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  return points.map(point => {
    const dist = distanceFromCenter(point);
    // Expected number of random points increases with distance.
    const expectedCount = baseCount + dist * distanceMultiplier * (dist/10 * distanceMultiplier + 1);
    // Vary the count randomly: factor in the range [1 - randomSpread, 1 + randomSpread].
    const factor = 1 + (Math.random() * 2 * randomSpread - randomSpread);
    const count = Math.max(1, Math.round(expectedCount * factor));
    
    const randomPoints: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      randomPoints.push(generateRandomPoint(point[0], point[1], radius));
    }
    return randomPoints;
  });
}
