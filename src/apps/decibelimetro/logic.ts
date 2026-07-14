/**
 * Convert a point on a circle (center cx,cy, radius r) at `angleDeg` into
 * cartesian coordinates. Uses SVG's angle convention: 0° is to the right,
 * and angles increase clockwise because SVG's y-axis grows downward.
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Build an SVG path `d` string for an arc from `startAngle` to `endAngle`
 * (degrees, SVG convention). Always sweeps clockwise (increasing angle).
 */
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const sweep = endAngle - startAngle;
  const largeArcFlag = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export const MIN_DB = 30;
export const MAX_DB = 120;
export const START_ANGLE = 135;
export const SWEEP_DEGREES = 270;

// Phone mics aren't calibrated instruments. This fixed offset converts the
// raw dBFS metering value into a rough dB(SPL) estimate so the number lines
// up with everyday comparisons (quiet room ~30dB, conversation ~60dB,
// traffic ~85dB). Calibrated against a reference SPL-meter app on-device:
// silence measured -40 dBFS / reference 50dB, conversation measured -25 dBFS
// / reference 65dB — both fit a +90 offset exactly (same 1:1 slope).
const DBFS_TO_SPL_OFFSET = 90;

export function dbfsToSplEstimate(dbfs: number): number {
  const estimated = dbfs + DBFS_TO_SPL_OFFSET;
  return Math.max(MIN_DB, Math.min(MAX_DB, estimated));
}

export function splToArcProgress(db: number): number {
  const clamped = Math.max(MIN_DB, Math.min(MAX_DB, db));
  return (clamped - MIN_DB) / (MAX_DB - MIN_DB);
}

export type NoiseZone = "calmo" | "moderado" | "alto";

export function splToZone(db: number): NoiseZone {
  if (db < 60) return "calmo";
  if (db < 85) return "moderado";
  return "alto";
}

/** Low-pass smoothing, same shape as the one used in bussola/nivel. */
export function smooth(prev: number, next: number, alpha = 0.2): number {
  return prev + alpha * (next - prev);
}

export interface ReferencePoint {
  db: number;
  label: string;
}

/** Ticks shown on the gauge so the number can be compared to everyday sounds. */
export const REFERENCE_POINTS: ReferencePoint[] = [
  { db: 30, label: "Silêncio" },
  { db: 60, label: "Conversa" },
  { db: 85, label: "Trânsito" },
  { db: 100, label: "Risco" },
];
