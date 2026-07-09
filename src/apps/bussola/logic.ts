const CARDINALS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"] as const;

/** 8-point cardinal direction in Portuguese (L = Leste, O = Oeste). */
export function cardinalPt(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return CARDINALS[index];
}

/**
 * Low-pass smoothing for an angle in degrees. Interpolates from `prev` toward
 * `next` along the SHORTEST path so the value never jumps backwards across the
 * 0/360 boundary (e.g. 350° -> 10° moves forward through 0, not back through 180).
 * `alpha` in (0,1]: higher = snappier, lower = smoother.
 */
export function smoothAngle(prev: number, next: number, alpha = 0.2): number {
  const diff = ((next - prev + 540) % 360) - 180; // shortest signed delta in (-180, 180]
  return ((prev + alpha * diff) % 360 + 360) % 360;
}
