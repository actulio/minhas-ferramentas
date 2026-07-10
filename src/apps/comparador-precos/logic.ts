export type Dimension = "peso" | "volume" | "unidade";

export interface ProductInput {
  price: number;
  qty: number;
  unit: string;
}

export interface ComparisonResult {
  winner: "A" | "B" | "empate" | null;
  displayPriceA: number | null;
  displayPriceB: number | null;
  displayUnit: string;
  percentCheaper: number | null;
}

/** factor = how many BASE units one of this unit represents. Base: peso→g, volume→ml, unidade→un. */
export const UNIT_FACTORS: Record<Dimension, Record<string, number>> = {
  peso: { g: 1, kg: 1000 },
  volume: { ml: 1, L: 1000 },
  unidade: { un: 1 },
};

/** Human-friendly unit used to display price-per-unit, per dimension. */
export const DISPLAY_UNIT: Record<Dimension, string> = {
  peso: "kg",
  volume: "L",
  unidade: "un",
};

export function parseDecimal(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return NaN;
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function isValid(p: ProductInput): boolean {
  return (
    Number.isFinite(p.price) &&
    p.price > 0 &&
    Number.isFinite(p.qty) &&
    p.qty > 0
  );
}

/** Price per BASE unit (grams / ml / un). Used for fair comparison. */
function basePrice(p: ProductInput, dim: Dimension): number {
  const factor = UNIT_FACTORS[dim][p.unit];
  return p.price / (p.qty * factor);
}

/** Price per the dimension's DISPLAY unit (per kg / L / un). Null if invalid. */
export function displayPrice(p: ProductInput, dim: Dimension): number | null {
  if (!isValid(p)) return null;
  const displayFactor = UNIT_FACTORS[dim][DISPLAY_UNIT[dim]];
  return basePrice(p, dim) * displayFactor;
}

export function compareProducts(
  a: ProductInput,
  b: ProductInput,
  dim: Dimension,
): ComparisonResult {
  const displayUnit = DISPLAY_UNIT[dim];
  const validA = isValid(a);
  const validB = isValid(b);
  const displayPriceA = validA ? displayPrice(a, dim) : null;
  const displayPriceB = validB ? displayPrice(b, dim) : null;

  if (!validA || !validB) {
    return { winner: null, displayPriceA, displayPriceB, displayUnit, percentCheaper: null };
  }

  const baseA = basePrice(a, dim);
  const baseB = basePrice(b, dim);

  if (baseA === baseB) {
    return { winner: "empate", displayPriceA, displayPriceB, displayUnit, percentCheaper: 0 };
  }

  const winner = baseA < baseB ? "A" : "B";
  const lower = Math.min(baseA, baseB);
  const higher = Math.max(baseA, baseB);
  const percentCheaper = ((higher - lower) / higher) * 100;

  return { winner, displayPriceA, displayPriceB, displayUnit, percentCheaper };
}
