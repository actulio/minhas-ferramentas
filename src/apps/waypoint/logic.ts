export type Coord = { latitude: number; longitude: number };

const EARTH_RADIUS_M = 6_371_000;
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance between two coordinates, in metres. */
export function haversineDistance(a: Coord, b: Coord): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Initial bearing from a to b, in degrees clockwise from true north [0,360). */
export function bearing(a: Coord, b: Coord): number {
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Rotation for the on-screen arrow given the target bearing and device heading. */
export function arrowRotation(targetBearing: number, heading: number): number {
  return (((targetBearing - heading) % 360) + 360) % 360;
}

/** Human-readable distance in pt-BR (metres, or km with one decimal). */
export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1).replace(".", ",")} km`;
}

/**
 * Low-pass smoothing for a heading angle in degrees. Interpolates from `prev`
 * toward `next` along the SHORTEST path so it never jumps backwards across the
 * 0/360 seam. Damps device-heading jitter before it drives the arrow.
 * `alpha` in (0,1]: higher = snappier, lower = smoother.
 */
export function smoothAngle(prev: number, next: number, alpha = 0.2): number {
  const diff = ((next - prev + 540) % 360) - 180; // shortest signed delta in (-180, 180]
  return ((prev + alpha * diff) % 360 + 360) % 360;
}
