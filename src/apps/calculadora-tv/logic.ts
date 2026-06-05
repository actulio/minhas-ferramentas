export const MULTIPLIER_MIN = 0.03048; // THX (40 degrees)
export const MULTIPLIER_MAX = 0.04064; // SMPTE (30 degrees)

export interface DistanceRange {
  minDistance: number;
  maxDistance: number;
  idealDistance: number;
}

export interface SizeRange {
  minSize: number;
  maxSize: number;
  idealSize: number;
}

/**
 * Calculates recommended viewing distance range in meters for a given TV size in inches.
 */
export function calculateDistanceRange(sizeInches: number): DistanceRange {
  if (sizeInches <= 0) {
    return { minDistance: 0, maxDistance: 0, idealDistance: 0 };
  }
  const minDistance = sizeInches * MULTIPLIER_MIN;
  const maxDistance = sizeInches * MULTIPLIER_MAX;

  return {
    minDistance,
    maxDistance,
    idealDistance: (minDistance + maxDistance) / 2,
  };
}

/**
 * Calculates recommended TV size range in inches for a given viewing distance in meters.
 */
export function calculateSizeRange(distanceMeters: number): SizeRange {
  if (distanceMeters <= 0) {
    return { minSize: 0, maxSize: 0, idealSize: 0 };
  }
  const minSize = distanceMeters / MULTIPLIER_MAX;
  const maxSize = distanceMeters / MULTIPLIER_MIN;

  return {
    minSize,
    maxSize,
    idealSize: (minSize + maxSize) / 2,
  };
}
