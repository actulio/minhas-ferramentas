/**
 * Convert accelerometer x/y/z (in g units) to pitch and roll in degrees.
 * Flat on a table (z≈1) yields pitch≈0, roll≈0.
 */
export function anglesFromAccelerometer(
  x: number,
  y: number,
  z: number,
): { pitch: number; roll: number } {
  const pitch = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
  const roll = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
  return { pitch, roll };
}

/** True when both pitch and roll are within `toleranceDeg` of level. */
export function isLevel(
  pitch: number,
  roll: number,
  toleranceDeg = 1,
): boolean {
  return Math.abs(pitch) <= toleranceDeg && Math.abs(roll) <= toleranceDeg;
}
