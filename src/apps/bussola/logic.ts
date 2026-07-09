/**
 * Compass heading from magnetometer x/y readings.
 * Returns a normalized angle in [0, 360). The Screen may apply a device
 * offset; this pure function has a fixed contract used by the tests.
 */
export function headingFromMagnetometer(x: number, y: number): number {
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

const CARDINALS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"] as const;

/** 8-point cardinal direction in Portuguese (L = Leste, O = Oeste). */
export function cardinalPt(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return CARDINALS[index];
}
