# Comparador de Preços — Design

**Date:** 2026-07-10
**Status:** Approved
**App id:** `comparador-precos`

## Purpose

A mini-app for the supermarket: compare two products with different prices
**and different quantities/units** to find out which one is the better deal
(lowest price per unit). Example: rice 500 g at R$ 8,00 vs 1,2 kg at R$ 14,00 —
the app normalizes both to a common base unit and reports the cheaper one plus
how much cheaper it is.

## Scope decisions (from brainstorming)

- **Unit handling:** smart normalization. User picks a *dimension*; each product's
  quantity can be entered in any unit of that dimension; the app converts to a base
  unit before comparing. Covers same-unit, same-dimension-different-unit, and count.
- **Number of products:** exactly 2 (Produto A vs Produto B). No add-more list.
- **Dimensions/units:** Peso (g, kg), Volume (ml, L), Unidade (un). No imperial units.
- **Category:** `utilidades`.
- **Name:** "Comparador de Preços".
- **Persistence:** none (ephemeral, quick in-store use).
- **Currency:** currency-neutral — no R$/CHF/€ symbol assumed. The comparison and
  the % difference are relative, so per-unit prices are shown as plain formatted
  numbers with the unit label (e.g. `16,00/kg`).

## App identity (`src/apps/comparador-precos/index.ts`)

```ts
export const comparadorPrecosApp: MiniAppConfig = {
  id: "comparador-precos",
  name: "Comparador de Preços",
  description: "Compare dois produtos e descubra qual compensa mais por unidade",
  category: "utilidades",
  icon: "ShoppingCart",
  component: ComparadorPrecosScreen,
};
```

## Architecture

Follows the established mini-app convention: an isolated folder with a pure
`logic.ts` (unit-tested), a reactive `Screen.tsx` driven by `useMemo` (no
"calculate" button), and `index.ts` exporting the `MiniAppConfig`.

```
src/apps/comparador-precos/
├── index.ts          # MiniAppConfig
├── logic.ts          # pure normalization + comparison
├── logic.test.ts     # Jest tests
└── Screen.tsx        # UI
```

### `logic.ts` (pure, no React)

Types and unit→base-factor maps:

```ts
export type Dimension = "peso" | "volume" | "unidade";

// factor = how many BASE units one of this unit represents
// base unit per dimension: peso→g, volume→ml, unidade→un
export const UNIT_FACTORS: Record<Dimension, Record<string, number>> = {
  peso:     { g: 1, kg: 1000 },
  volume:   { ml: 1, L: 1000 },
  unidade:  { un: 1 },
};

// The unit used for human-friendly display of price-per-unit, per dimension.
export const DISPLAY_UNIT: Record<Dimension, string> = {
  peso: "kg",
  volume: "L",
  unidade: "un",
};
```

Functions:

- `parseDecimal(value: string): number` — trims, converts comma to dot,
  returns a finite number or `NaN` for empty/invalid input. (Same convention as
  other apps.)
- `basePrice(price: number, qty: number, unit: string, dim: Dimension): number`
  — returns price per **base** unit: `price / (qty * UNIT_FACTORS[dim][unit])`.
  Used internally for fair comparison.
- `displayPrice(price, qty, unit, dim): number` — price per the dimension's
  **display** unit (per kg / per L / per un), for showing to the user.
- `compareProducts(a, b, dim)` where `a`/`b` are `{ price, qty, unit }` →

  ```ts
  interface ComparisonResult {
    winner: "A" | "B" | "empate" | null; // null = not enough valid input
    displayPriceA: number | null;
    displayPriceB: number | null;
    displayUnit: string;                 // "kg" | "L" | "un"
    percentCheaper: number | null;       // how much cheaper the winner is, 0–100
  }
  ```

### Comparison / edge-case rules

- A product is **valid** only when `price > 0` and `qty > 0` (finite). Invalid or
  empty inputs → that product's `displayPrice` is `null`.
- If **both** valid: compare base prices. Lower base price wins. `percentCheaper`
  = `(loser - winner) / loser * 100` on base prices.
- Equal base prices → `winner: "empate"`, `percentCheaper: 0`.
- Only **one** valid → `winner: null` (nothing to compare yet; still show that
  product's per-unit price). No crash, no misleading "winner".
- Neither valid → all-null result; UI shows a hint/placeholder.

## `Screen.tsx`

State (all `useState<string>` for inputs, matching existing screens):
- `dimension: Dimension` (default `"peso"`).
- `priceA, qtyA, unitA` and `priceB, qtyB, unitB`.
- When `dimension` changes, reset each product's `unit` to that dimension's base
  unit (e.g. switching to Volume sets units to `ml`).

Layout (inside `ScrollView`):
1. `SegmentedControl` — dimension picker: **Peso / Volume / Unidade**.
2. `GlassCard` "Produto A": `NumericInput` Preço, then a row with `NumericInput`
   Quantidade + a `SegmentedControl` unit picker (g/kg, ml/L). For `unidade` the
   unit picker is hidden (only `un`).
3. `GlassCard` "Produto B": identical.
4. Result: a `ResultDisplay` (gradient) showing the headline, e.g.
   **"Produto B — 27% mais barato"** (or "Empate" / a neutral prompt when
   incomplete). Below it, both per-unit prices: `A: 16,00/kg` · `B: 11,67/kg`,
   with the winner visually emphasized.

Result is derived with `useMemo(() => compareProducts(...), [inputs])` — live,
no button. Number formatting reuses the comma-decimal `formatNumber` pattern
(dot→comma, capped precision).

## Tests (`logic.test.ts`)

- Cross-unit weight: A = R$8 / 500 g, B = R$14 / 1,2 kg → B wins, ~27% cheaper.
- Same-unit weight (1 kg vs 5 kg).
- Volume ml vs L.
- Count (un): 12-pack vs 30-pack.
- Tie: identical base price → `empate`, 0%.
- Only one product valid → `winner: null`, other's `displayPrice` present.
- Empty / zero / negative / non-numeric inputs → treated invalid, no throw.
- `percentCheaper` math correctness on a known case.

## Wiring

- Register in `src/registry/index.ts`: import `comparadorPrecosApp`, add to
  `appRegistry` array (place among the `utilidades` apps).
- Add a row to the README "Utilidades" table describing the app.

## Out of scope (YAGNI)

- More than 2 products.
- Imperial units (oz/lb/fl oz).
- Saving/history of comparisons.
- Currency symbols / exchange rates.
- Barcode scanning or product database.
