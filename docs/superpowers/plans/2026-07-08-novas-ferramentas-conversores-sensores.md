# Novas ferramentas (conversores + sensores) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a time converter and a temperature converter (as tabs in the existing `conversor-unidades` app) plus three sensor-based mini-apps — compass, bubble level, and multi-waypoint marker.

**Architecture:** Follow the existing plugin-registry pattern: each capability is a folder under `src/apps/<slug>/` with pure `logic.ts` (unit-tested) + `Screen.tsx` (UI, subscribes to sensors) + `index.ts` (`MiniAppConfig`), registered in `src/registry/index.ts`. Converters reuse the existing `conversor-unidades` screen by adding two tabs. All math lives in `logic.ts` and is covered by Jest; sensor-subscription code in `Screen.tsx` is verified manually on a physical device.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript, Jest (jest-expo), Zustand + AsyncStorage, `expo-sensors` (Magnetometer/Accelerometer), `expo-location` (GPS), lucide-react-native, expo-linear-gradient.

**Conventions:**
- Language: **Portuguese only** (matches existing app; no i18n layer).
- Test runner: `npx jest <path>` (project has `pnpm`; `npx jest` works directly).
- Commit after each task. Work on a branch `feat/novas-ferramentas` (create it in Task 0).
- Icons must be added to `iconMap` in `src/components/AppCard.tsx` or the card renders blank.

---

## Task 0: Create working branch

- [ ] **Step 1: Create and switch to a feature branch**

Run:
```bash
cd /Users/work/personal/random/minhas-ferramentas
git checkout -b feat/novas-ferramentas
```
Expected: `Switched to a new branch 'feat/novas-ferramentas'`

---

## Task 1: Time conversion logic

**Files:**
- Modify: `src/apps/conversor-unidades/logic.ts` (append)
- Test: `src/apps/conversor-unidades/logic.test.ts` (append)

- [ ] **Step 1: Write the failing tests** — append to `src/apps/conversor-unidades/logic.test.ts`:

```ts
import { TIME_FACTORS, convertTime, type TimeUnit } from "./logic";

describe("convertTime", () => {
  it("converts seconds to minutes", () => {
    expect(convertTime(120, "s", "min")).toBe(2);
  });
  it("converts hours to seconds", () => {
    expect(convertTime(1, "h", "s")).toBe(3600);
  });
  it("converts days to hours", () => {
    expect(convertTime(1, "d", "h")).toBe(24);
  });
  it("converts years to days (365-day year)", () => {
    expect(convertTime(2, "ano", "d")).toBe(730);
  });
  it("returns the same value when units match", () => {
    expect(convertTime(5, "min", "min")).toBe(5);
  });
  it("exposes seconds as the base factor", () => {
    expect(TIME_FACTORS.s).toBe(1);
    expect(TIME_FACTORS.ano).toBe(31_536_000);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/apps/conversor-unidades/logic.test.ts -t convertTime`
Expected: FAIL — `convertTime` / `TIME_FACTORS` not exported.

- [ ] **Step 3: Implement** — append to `src/apps/conversor-unidades/logic.ts`:

```ts
/**
 * Time conversion. All factors express one unit in seconds.
 * 1 ano = 365 dias (aproximação; ignora anos bissextos).
 */
export type TimeUnit = "s" | "min" | "h" | "d" | "ano";

export const TIME_FACTORS: Record<TimeUnit, number> = {
  s: 1,
  min: 60,
  h: 3600,
  d: 86_400,
  ano: 31_536_000,
};

export function convertTime(
  value: number,
  from: TimeUnit,
  to: TimeUnit,
): number {
  return (value * TIME_FACTORS[from]) / TIME_FACTORS[to];
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/apps/conversor-unidades/logic.test.ts -t convertTime`
Expected: PASS (6 passing).

- [ ] **Step 5: Commit**

```bash
git add src/apps/conversor-unidades/logic.ts src/apps/conversor-unidades/logic.test.ts
git commit -m "feat(conversor): add time conversion logic and tests"
```

---

## Task 2: Temperature conversion logic

**Files:**
- Modify: `src/apps/conversor-unidades/logic.ts` (append)
- Test: `src/apps/conversor-unidades/logic.test.ts` (append)

- [ ] **Step 1: Write the failing tests** — append to `src/apps/conversor-unidades/logic.test.ts`:

```ts
import { cToF, fToC } from "./logic";

describe("temperature conversion", () => {
  it("converts freezing point 0C to 32F", () => {
    expect(cToF(0)).toBe(32);
  });
  it("converts boiling point 100C to 212F", () => {
    expect(cToF(100)).toBe(212);
  });
  it("converts 32F back to 0C", () => {
    expect(fToC(32)).toBe(0);
  });
  it("has -40 as the crossover point", () => {
    expect(cToF(-40)).toBe(-40);
    expect(fToC(-40)).toBe(-40);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/apps/conversor-unidades/logic.test.ts -t "temperature conversion"`
Expected: FAIL — `cToF` / `fToC` not exported.

- [ ] **Step 3: Implement** — append to `src/apps/conversor-unidades/logic.ts`:

```ts
/** Temperature conversion: Celsius <-> Fahrenheit. */
export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/apps/conversor-unidades/logic.test.ts -t "temperature conversion"`
Expected: PASS (4 passing).

- [ ] **Step 5: Commit**

```bash
git add src/apps/conversor-unidades/logic.ts src/apps/conversor-unidades/logic.test.ts
git commit -m "feat(conversor): add temperature conversion logic and tests"
```

---

## Task 3: Wire "Tempo" and "Temperatura" tabs into the converter screen

**Files:**
- Modify: `src/apps/conversor-unidades/Screen.tsx`

The existing screen uses a `tabs` array + a `TabType` union + per-tab state, and renders a block per `activeTab`. Add two new tabs. Below are the exact insertions.

- [ ] **Step 1: Extend the imports** — in `src/apps/conversor-unidades/Screen.tsx`, replace the logic import block:

Existing:
```ts
import {
  convertMlToOz,
  convertOzToMl,
  convertFtToM,
  convertMToFt,
  convertInToCm,
  convertCmToIn,
  parseOunceInput,
} from "./logic";
```
Replace with:
```ts
import {
  convertMlToOz,
  convertOzToMl,
  convertFtToM,
  convertMToFt,
  convertInToCm,
  convertCmToIn,
  parseOunceInput,
  convertTime,
  cToF,
  fToC,
  TIME_FACTORS,
  type TimeUnit,
} from "./logic";
```

- [ ] **Step 2: Extend the tab union and the tabs array**

Replace:
```ts
type TabType = "volume" | "ft_m" | "in_cm";

const tabs = [
  { label: "Volume", value: "volume" },
  { label: "Pés / Metros", value: "ft_m" },
  { label: "Pol. / Centímetros", value: "in_cm" },
];
```
With:
```ts
type TabType = "volume" | "ft_m" | "in_cm" | "tempo" | "temperatura";

const tabs = [
  { label: "Volume", value: "volume" },
  { label: "Pés / Metros", value: "ft_m" },
  { label: "Pol. / Centímetros", value: "in_cm" },
  { label: "Tempo", value: "tempo" },
  { label: "Temperatura", value: "temperatura" },
];

const timeUnitSegments = [
  { label: "seg", value: "s" },
  { label: "min", value: "min" },
  { label: "h", value: "h" },
  { label: "dias", value: "d" },
  { label: "anos", value: "ano" },
];

const timeUnitLabels: Record<TimeUnit, string> = {
  s: "Segundos",
  min: "Minutos",
  h: "Horas",
  d: "Dias",
  ano: "Anos",
};

const allTimeUnits: TimeUnit[] = ["s", "min", "h", "d", "ano"];

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 1e6) / 1e6;
  return String(rounded).replace(".", ",");
}
```

- [ ] **Step 3: Add state for the two new tabs** — immediately after the existing `const [activeTab, setActiveTab] = useState<TabType>("volume");` line, add:

```ts
  // Tempo: one value + a source unit, converted to all other units
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("h");
  const [timeValue, setTimeValue] = useState("");

  // Temperatura: bidirectional C <-> F
  const [tempActiveField, setTempActiveField] = useState<"c" | "f">("c");
  const [tempValue, setTempValue] = useState("");
```

- [ ] **Step 4: Add derived values** — add near the other `useMemo` blocks in the component body (before the `return`):

```ts
  const timeResults = useMemo(() => {
    const parsed = parseFloat(timeValue.replace(",", ".")) || 0;
    return allTimeUnits
      .filter((u) => u !== timeUnit)
      .map((u) => ({
        unit: u,
        label: timeUnitLabels[u],
        value: formatNumber(convertTime(parsed, timeUnit, u)),
      }));
  }, [timeValue, timeUnit]);

  const tempValues = useMemo(() => {
    const parsed = parseFloat(tempValue.replace(",", ".")) || 0;
    if (tempActiveField === "c") {
      return { c: tempValue, f: tempValue ? formatNumber(cToF(parsed)) : "" };
    }
    return { c: tempValue ? formatNumber(fToC(parsed)) : "", f: tempValue };
  }, [tempValue, tempActiveField]);
```

- [ ] **Step 5: Render the "Tempo" tab** — inside the main input `GlassCard` (the one with `style={{ marginBottom: 16 }}` containing the `activeTab === ...` blocks), after the `{activeTab === "in_cm" && ( ... )}` block, add:

```tsx
          {activeTab === "tempo" && (
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: colors.text.accent,
                  marginBottom: 8,
                }}
              >
                Unidade de origem:
              </Text>
              <SegmentedControl
                segments={timeUnitSegments}
                selectedValue={timeUnit}
                onSelect={(val) => setTimeUnit(val as TimeUnit)}
              />
              <NumericInput
                label={timeUnitLabels[timeUnit]}
                value={timeValue}
                onChangeText={setTimeValue}
                placeholder="0"
                suffix={timeUnit === "ano" ? "anos" : timeUnit}
              />
              <View style={{ marginTop: 4 }}>
                {timeResults.map((r) => (
                  <View
                    key={r.unit}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{ color: colors.text.secondary, fontSize: 14 }}
                    >
                      {r.label}
                    </Text>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {r.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === "temperatura" && (
            <View>
              <NumericInput
                label="Celsius (°C)"
                value={tempValues.c}
                onChangeText={(text) => {
                  setTempActiveField("c");
                  setTempValue(text);
                }}
                placeholder="0"
                suffix="°C"
                keyboardType="numbers-and-punctuation"
              />
              <NumericInput
                label="Fahrenheit (°F)"
                value={tempValues.f}
                onChangeText={(text) => {
                  setTempActiveField("f");
                  setTempValue(text);
                }}
                placeholder="0"
                suffix="°F"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          )}
```

- [ ] **Step 6: Add reference formulas** — in the "Fórmulas de Referência" `GlassCard`, after the `{activeTab === "in_cm" && ( ... )}` block, add:

```tsx
          {activeTab === "tempo" && (
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                • 1 min = 60 s • 1 h = 3600 s • 1 dia = 86.400 s
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                • 1 ano = 365 dias (aproximação)
              </Text>
            </View>
          )}
          {activeTab === "temperatura" && (
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                • °F = °C × 9/5 + 32
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                • °C = (°F − 32) × 5/9
              </Text>
            </View>
          )}
```

- [ ] **Step 7: Update the app description** — in `src/apps/conversor-unidades/index.ts`, replace the `description` line:

```ts
  description:
    "Converta volume, comprimento, tempo e temperatura",
```

- [ ] **Step 8: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src/apps/conversor-unidades`
Expected: no errors.

- [ ] **Step 9: Manual smoke check (optional but recommended)**

Run: `npx expo start` — open the Conversor de Unidades app, verify the "Tempo" and "Temperatura" tabs appear and convert. Stop the server when done.

- [ ] **Step 10: Commit**

```bash
git add src/apps/conversor-unidades/Screen.tsx src/apps/conversor-unidades/index.ts
git commit -m "feat(conversor): add Tempo and Temperatura tabs"
```

---

## Task 4: Install sensor/location dependencies and configure permissions

**Files:**
- Modify: `package.json` (via installer)
- Modify: `app.json`
- Modify: `src/components/AppCard.tsx`

- [ ] **Step 1: Install the Expo modules (SDK-matched versions)**

Run:
```bash
npx expo install expo-sensors expo-location
```
Expected: both added to `package.json` dependencies without SDK-mismatch warnings.

- [ ] **Step 2: Add the location plugin + permission strings to `app.json`**

In `app.json`, replace the `"plugins"` array:
```json
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-system-ui"
    ],
```
with:
```json
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-system-ui",
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Este app usa sua localização para marcar pontos e apontar de volta para eles."
        }
      ]
    ],
```

- [ ] **Step 3: Add iOS motion usage description** — in `app.json`, replace the `"ios"` block:
```json
    "ios": {
      "supportsTablet": true
    },
```
with:
```json
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSMotionUsageDescription": "Este app usa os sensores de movimento para a bússola e o nível."
      }
    },
```

- [ ] **Step 4: Register new icons in the iconMap** — in `src/components/AppCard.tsx`, replace the lucide import block:
```ts
import {
  TrendingUp,
  CreditCard,
  ArrowLeftRight,
  Heart,
  type LucideProps,
} from "lucide-react-native";
```
with:
```ts
import {
  TrendingUp,
  CreditCard,
  ArrowLeftRight,
  Heart,
  Compass,
  Crosshair,
  MapPin,
  type LucideProps,
} from "lucide-react-native";
```
and replace the `iconMap` object:
```ts
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  TrendingUp,
  CreditCard,
  ArrowLeftRight,
};
```
with:
```ts
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  TrendingUp,
  CreditCard,
  ArrowLeftRight,
  Compass,
  Crosshair,
  MapPin,
};
```

> Note: the home screen (`app/(tabs)/index.tsx`) and other cards render icons through this same `iconMap`. The existing apps use icons (e.g. `Ruler`) that may already resolve via a broader map elsewhere; only the three names above (`Compass`, `Crosshair`, `MapPin`) are required for this plan.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json app.json src/components/AppCard.tsx pnpm-lock.yaml
git commit -m "chore: add expo-sensors + expo-location, permissions, and new icons"
```

---

## Task 5: Compass logic

**Files:**
- Create: `src/apps/bussola/logic.ts`
- Test: `src/apps/bussola/logic.test.ts`

- [ ] **Step 1: Write the failing tests** — create `src/apps/bussola/logic.test.ts`:

```ts
import { headingFromMagnetometer, cardinalPt } from "./logic";

describe("headingFromMagnetometer", () => {
  it("returns 0 for +x axis", () => {
    expect(Math.round(headingFromMagnetometer(1, 0))).toBe(0);
  });
  it("returns 90 for +y axis", () => {
    expect(Math.round(headingFromMagnetometer(0, 1))).toBe(90);
  });
  it("returns 180 for -x axis", () => {
    expect(Math.round(headingFromMagnetometer(-1, 0))).toBe(180);
  });
  it("returns 270 for -y axis", () => {
    expect(Math.round(headingFromMagnetometer(0, -1))).toBe(270);
  });
});

describe("cardinalPt", () => {
  it("maps cardinal degrees to pt-BR labels", () => {
    expect(cardinalPt(0)).toBe("N");
    expect(cardinalPt(45)).toBe("NE");
    expect(cardinalPt(90)).toBe("L");
    expect(cardinalPt(180)).toBe("S");
    expect(cardinalPt(270)).toBe("O");
  });
  it("wraps around near 360", () => {
    expect(cardinalPt(359)).toBe("N");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/apps/bussola/logic.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — create `src/apps/bussola/logic.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/apps/bussola/logic.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apps/bussola/logic.ts src/apps/bussola/logic.test.ts
git commit -m "feat(bussola): add compass heading logic and tests"
```

---

## Task 6: Compass screen + registration

**Files:**
- Create: `src/apps/bussola/Screen.tsx`
- Create: `src/apps/bussola/index.ts`
- Modify: `src/registry/index.ts`

- [ ] **Step 1: Create the screen** — `src/apps/bussola/Screen.tsx`:

```tsx
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Magnetometer } from "expo-sensors";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { headingFromMagnetometer, cardinalPt } from "./logic";

export default function BussolaScreen() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      setHeading(headingFromMagnetometer(x, y));
    });
    return () => sub.remove();
  }, []);

  const rounded = Math.round(heading);

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
    >
      <View
        style={{
          width: 260,
          height: 260,
          borderRadius: 130,
          borderWidth: 2,
          borderColor: colors.glass.border,
          justifyContent: "center",
          alignItems: "center",
          transform: [{ rotate: `${-heading}deg` }],
        }}
      >
        <Text style={{ position: "absolute", top: 12, color: colors.error, fontWeight: "700", fontSize: 20 }}>
          N
        </Text>
        <Text style={{ position: "absolute", right: 16, color: colors.text.secondary, fontSize: 16 }}>L</Text>
        <Text style={{ position: "absolute", bottom: 12, color: colors.text.secondary, fontSize: 16 }}>S</Text>
        <Text style={{ position: "absolute", left: 16, color: colors.text.secondary, fontSize: 16 }}>O</Text>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 12,
            borderRightWidth: 12,
            borderBottomWidth: 90,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: colors.accent.start,
          }}
        />
      </View>

      <GlassCard style={{ marginTop: 32, alignItems: "center", minWidth: 200 }}>
        <Text style={{ fontSize: 48, fontWeight: "700", color: colors.text.primary }}>
          {rounded}°
        </Text>
        <Text style={{ fontSize: 20, color: colors.text.accent, marginTop: 4 }}>
          {cardinalPt(heading)}
        </Text>
      </GlassCard>

      <Text style={{ marginTop: 16, color: colors.text.muted, fontSize: 12, textAlign: "center" }}>
        Heading magnético. Longe de metais/ímãs para maior precisão.
      </Text>
    </LinearGradient>
  );
}
```

- [ ] **Step 2: Create the config** — `src/apps/bussola/index.ts`:

```ts
import { type MiniAppConfig } from "@/registry/types";
import BussolaScreen from "./Screen";

export const bussolaApp: MiniAppConfig = {
  id: "bussola",
  name: "Bússola",
  description: "Aponte para o norte com o magnetômetro do celular",
  category: "utilidades",
  icon: "Compass",
  component: BussolaScreen,
};
```

- [ ] **Step 3: Register the app** — in `src/registry/index.ts`, add the import after the last existing import:
```ts
import { bussolaApp } from "@/apps/bussola";
```
and add `bussolaApp,` as the last entry of the `appRegistry` array.

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/apps/bussola src/registry`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/apps/bussola/Screen.tsx src/apps/bussola/index.ts src/registry/index.ts
git commit -m "feat(bussola): add compass screen and register app"
```

---

## Task 7: Bubble level logic

**Files:**
- Create: `src/apps/nivel/logic.ts`
- Test: `src/apps/nivel/logic.test.ts`

- [ ] **Step 1: Write the failing tests** — create `src/apps/nivel/logic.test.ts`:

```ts
import { anglesFromAccelerometer, isLevel } from "./logic";

describe("anglesFromAccelerometer", () => {
  it("reports ~0 pitch and roll when flat (z=1)", () => {
    const { pitch, roll } = anglesFromAccelerometer(0, 0, 1);
    expect(Math.abs(pitch)).toBeLessThan(0.5);
    expect(Math.abs(roll)).toBeLessThan(0.5);
  });
  it("reports ~90 pitch when tilted on the y axis", () => {
    const { pitch } = anglesFromAccelerometer(0, 1, 0);
    expect(Math.round(pitch)).toBe(90);
  });
  it("reports ~90 roll when tilted on the x axis", () => {
    const { roll } = anglesFromAccelerometer(1, 0, 0);
    expect(Math.round(roll)).toBe(90);
  });
});

describe("isLevel", () => {
  it("is true within tolerance", () => {
    expect(isLevel(0.4, -0.3, 1)).toBe(true);
  });
  it("is false outside tolerance", () => {
    expect(isLevel(5, 0, 1)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/apps/nivel/logic.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — create `src/apps/nivel/logic.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/apps/nivel/logic.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apps/nivel/logic.ts src/apps/nivel/logic.test.ts
git commit -m "feat(nivel): add bubble-level angle logic and tests"
```

---

## Task 8: Bubble level screen + registration

**Files:**
- Create: `src/apps/nivel/Screen.tsx`
- Create: `src/apps/nivel/index.ts`
- Modify: `src/registry/index.ts`

- [ ] **Step 1: Create the screen** — `src/apps/nivel/Screen.tsx`:

```tsx
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Accelerometer } from "expo-sensors";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { anglesFromAccelerometer, isLevel } from "./logic";

const RADIUS = 120; // outer circle radius
const BUBBLE = 40;

export default function NivelScreen() {
  const [angles, setAngles] = useState({ pitch: 0, roll: 0 });

  useEffect(() => {
    Accelerometer.setUpdateInterval(60);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      setAngles(anglesFromAccelerometer(x, y, z));
    });
    return () => sub.remove();
  }, []);

  const level = isLevel(angles.pitch, angles.roll, 1);
  const maxOffset = RADIUS - BUBBLE / 2;
  const clamp = (v: number) => Math.max(-maxOffset, Math.min(maxOffset, v));
  // Map degrees to pixels: ~4px per degree, capped at the circle edge.
  const dx = clamp(angles.roll * 4);
  const dy = clamp(angles.pitch * 4);

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
    >
      <View
        style={{
          width: RADIUS * 2,
          height: RADIUS * 2,
          borderRadius: RADIUS,
          borderWidth: 2,
          borderColor: level ? colors.success : colors.glass.border,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ position: "absolute", width: RADIUS * 2, height: 1, backgroundColor: colors.glass.border }} />
        <View style={{ position: "absolute", width: 1, height: RADIUS * 2, backgroundColor: colors.glass.border }} />
        <View
          style={{
            width: BUBBLE,
            height: BUBBLE,
            borderRadius: BUBBLE / 2,
            backgroundColor: level ? colors.success : colors.accent.start,
            transform: [{ translateX: dx }, { translateY: dy }],
          }}
        />
      </View>

      <GlassCard style={{ marginTop: 32, alignItems: "center", minWidth: 220 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: level ? colors.success : colors.text.primary }}>
          {level ? "Nivelado" : "Ajuste a superfície"}
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 6 }}>
          Inclinação: {angles.pitch.toFixed(1)}° / {angles.roll.toFixed(1)}°
        </Text>
      </GlassCard>
    </LinearGradient>
  );
}
```

- [ ] **Step 2: Create the config** — `src/apps/nivel/index.ts`:

```ts
import { type MiniAppConfig } from "@/registry/types";
import NivelScreen from "./Screen";

export const nivelApp: MiniAppConfig = {
  id: "nivel",
  name: "Nível",
  description: "Nível de bolha usando o acelerômetro do celular",
  category: "utilidades",
  icon: "Crosshair",
  component: NivelScreen,
};
```

- [ ] **Step 3: Register the app** — in `src/registry/index.ts`, add the import:
```ts
import { nivelApp } from "@/apps/nivel";
```
and add `nivelApp,` as the last entry of the `appRegistry` array.

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/apps/nivel src/registry`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/apps/nivel/Screen.tsx src/apps/nivel/index.ts src/registry/index.ts
git commit -m "feat(nivel): add bubble-level screen and register app"
```

---

## Task 9: Waypoint logic

**Files:**
- Create: `src/apps/waypoint/logic.ts`
- Test: `src/apps/waypoint/logic.test.ts`

- [ ] **Step 1: Write the failing tests** — create `src/apps/waypoint/logic.test.ts`:

```ts
import {
  haversineDistance,
  bearing,
  arrowRotation,
  formatDistance,
  type Coord,
} from "./logic";

const origin: Coord = { latitude: 0, longitude: 0 };

describe("haversineDistance", () => {
  it("is 0 for the same point", () => {
    expect(haversineDistance(origin, origin)).toBe(0);
  });
  it("computes ~111km for 1 degree of latitude", () => {
    const d = haversineDistance(origin, { latitude: 1, longitude: 0 });
    expect(d).toBeGreaterThan(110000);
    expect(d).toBeLessThan(112000);
  });
});

describe("bearing", () => {
  it("points north (0deg) for a point due north", () => {
    expect(Math.round(bearing(origin, { latitude: 1, longitude: 0 }))).toBe(0);
  });
  it("points east (90deg) for a point due east", () => {
    expect(Math.round(bearing(origin, { latitude: 0, longitude: 1 }))).toBe(90);
  });
});

describe("arrowRotation", () => {
  it("subtracts heading from the target bearing", () => {
    expect(arrowRotation(90, 45)).toBe(45);
  });
  it("wraps into [0,360)", () => {
    expect(arrowRotation(0, 90)).toBe(270);
  });
});

describe("formatDistance", () => {
  it("uses metres below 1km", () => {
    expect(formatDistance(500)).toBe("500 m");
  });
  it("uses km with one decimal above 1km", () => {
    expect(formatDistance(1300)).toBe("1,3 km");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/apps/waypoint/logic.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — create `src/apps/waypoint/logic.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/apps/waypoint/logic.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apps/waypoint/logic.ts src/apps/waypoint/logic.test.ts
git commit -m "feat(waypoint): add distance/bearing logic and tests"
```

---

## Task 10: Waypoint saved-list component

**Files:**
- Create: `src/apps/waypoint/SavedWaypoints.tsx`

- [ ] **Step 1: Create the component** — `src/apps/waypoint/SavedWaypoints.tsx`:

```tsx
import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Trash2, Navigation } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { type Coord } from "./logic";

export interface Waypoint {
  id: string;
  name: string;
  coord: Coord;
  createdAt: string;
}

interface SavedWaypointsProps {
  items: Waypoint[];
  activeId: string | null;
  onSelect: (item: Waypoint) => void;
  onDelete: (id: string) => void;
}

export function SavedWaypoints({
  items,
  activeId,
  onSelect,
  onDelete,
}: SavedWaypointsProps) {
  if (items.length === 0) return null;

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Excluir waypoint", `Deseja excluir "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => onDelete(id) },
    ]);
  };

  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.text.accent,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginBottom: 12,
        }}
      >
        Locais Salvos
      </Text>
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <Pressable key={item.id} onPress={() => onSelect(item)}>
            <GlassCard
              style={{
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                borderColor: isActive ? colors.accent.start : colors.glass.border,
              }}
            >
              <Navigation
                color={isActive ? colors.accent.start : colors.text.muted}
                size={18}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text.primary }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
                  {item.coord.latitude.toFixed(5)}, {item.coord.longitude.toFixed(5)}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDelete(item.id, item.name)}
                hitSlop={12}
                style={{ padding: 8 }}
              >
                <Trash2 color={colors.error} size={18} />
              </Pressable>
            </GlassCard>
          </Pressable>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/apps/waypoint/SavedWaypoints.tsx
git commit -m "feat(waypoint): add saved-waypoints list component"
```

---

## Task 11: Waypoint screen + registration

**Files:**
- Create: `src/apps/waypoint/Screen.tsx`
- Create: `src/apps/waypoint/index.ts`
- Modify: `src/registry/index.ts`

- [ ] **Step 1: Create the screen** — `src/apps/waypoint/Screen.tsx`:

```tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin } from "lucide-react-native";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { loadJSON, saveJSON } from "@/store/storage";
import {
  haversineDistance,
  bearing,
  arrowRotation,
  formatDistance,
  headingFromMagnetometerSafe,
  type Coord,
} from "./logic";
import { SavedWaypoints, type Waypoint } from "./SavedWaypoints";

const STORAGE_KEY = "waypoint-saved-points";

export default function WaypointScreen() {
  const [permission, setPermission] = useState<"unknown" | "granted" | "denied">("unknown");
  const [current, setCurrent] = useState<Coord | null>(null);
  const [heading, setHeading] = useState(0);
  const [items, setItems] = useState<Waypoint[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  // Load saved waypoints on mount
  useEffect(() => {
    loadJSON<Waypoint[]>(STORAGE_KEY).then((saved) => {
      if (saved) setItems(saved);
    });
  }, []);

  // Request permission + start watching position and heading
  useEffect(() => {
    let magSub: { remove: () => void } | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermission("denied");
        return;
      }
      setPermission("granted");
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (loc) => setCurrent({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }),
      );
      Magnetometer.setUpdateInterval(120);
      magSub = Magnetometer.addListener(({ x, y }) => {
        setHeading(headingFromMagnetometerSafe(x, y));
      });
    })();
    return () => {
      watchRef.current?.remove();
      magSub?.remove();
    };
  }, []);

  const persist = useCallback(async (next: Waypoint[]) => {
    setItems(next);
    await saveJSON(STORAGE_KEY, next);
  }, []);

  const handleMark = useCallback(async () => {
    if (!current) {
      Alert.alert("Sem localização", "Aguardando sinal de GPS. Tente novamente em instantes.");
      return;
    }
    const wpName = name.trim() || `Local ${items.length + 1}`;
    const wp: Waypoint = {
      id: String(Date.now()),
      name: wpName,
      coord: current,
      createdAt: new Date().toISOString(),
    };
    await persist([wp, ...items]);
    setActiveId(wp.id);
    setName("");
  }, [current, name, items, persist]);

  const handleDelete = useCallback(
    (id: string) => {
      persist(items.filter((i) => i.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [items, activeId, persist],
  );

  const active = items.find((i) => i.id === activeId) ?? null;
  const distance = active && current ? haversineDistance(current, active.coord) : null;
  const targetBearing = active && current ? bearing(current, active.coord) : 0;
  const rotation = arrowRotation(targetBearing, heading);

  if (permission === "denied") {
    return (
      <LinearGradient
        colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}
      >
        <Text style={{ color: colors.text.primary, fontSize: 16, textAlign: "center", marginBottom: 16 }}>
          Permissão de localização negada. Habilite o acesso à localização nas configurações do sistema para usar o waypoint.
        </Text>
        <Pressable
          onPress={async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setPermission(status === "granted" ? "granted" : "denied");
          }}
          style={{ backgroundColor: colors.accent.start, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Tentar novamente</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.bg.start, colors.bg.mid, colors.bg.end]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {active && (
          <GlassCard style={{ alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 26,
                borderRightWidth: 26,
                borderBottomWidth: 120,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderBottomColor: colors.accent.start,
                transform: [{ rotate: `${rotation}deg` }],
                marginVertical: 20,
              }}
            />
            <Text style={{ fontSize: 40, fontWeight: "700", color: colors.text.primary }}>
              {distance !== null ? formatDistance(distance) : "—"}
            </Text>
            <Text style={{ fontSize: 16, color: colors.text.accent, marginTop: 4 }}>
              até {active.name}
            </Text>
          </GlassCard>
        )}

        <GlassCard style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text.accent, marginBottom: 8 }}>
            Nome do local (opcional)
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Carro, Barraca, Trilha"
            placeholderTextColor={colors.text.muted}
            style={{
              backgroundColor: colors.glass.bg,
              borderWidth: 1,
              borderColor: colors.glass.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.text.primary,
              fontSize: 16,
              marginBottom: 12,
            }}
          />
          <Pressable
            onPress={handleMark}
            style={{
              backgroundColor: colors.accent.start,
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MapPin color="#fff" size={18} style={{ marginRight: 8 }} />
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
              Marcar local aqui
            </Text>
          </Pressable>
          {current && (
            <Text style={{ color: colors.text.muted, fontSize: 12, marginTop: 8, textAlign: "center" }}>
              Posição atual: {current.latitude.toFixed(5)}, {current.longitude.toFixed(5)}
            </Text>
          )}
        </GlassCard>

        <SavedWaypoints
          items={items}
          activeId={activeId}
          onSelect={(wp) => setActiveId(wp.id)}
          onDelete={handleDelete}
        />
      </ScrollView>
    </LinearGradient>
  );
}
```

- [ ] **Step 2: Add `headingFromMagnetometerSafe` to waypoint logic** — the screen imports a heading helper from `./logic`. Append to `src/apps/waypoint/logic.ts`:

```ts
/**
 * Compass heading (0-360) from magnetometer x/y for the waypoint arrow.
 * Duplicated intentionally so the waypoint app has no cross-app dependency.
 */
export function headingFromMagnetometerSafe(x: number, y: number): number {
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}
```

- [ ] **Step 3: Add a test for the heading helper** — append to `src/apps/waypoint/logic.test.ts`:

```ts
import { headingFromMagnetometerSafe } from "./logic";

describe("headingFromMagnetometerSafe", () => {
  it("returns 90 for +y axis", () => {
    expect(Math.round(headingFromMagnetometerSafe(0, 1))).toBe(90);
  });
  it("normalizes negatives into [0,360)", () => {
    expect(Math.round(headingFromMagnetometerSafe(0, -1))).toBe(270);
  });
});
```

Run: `npx jest src/apps/waypoint/logic.test.ts`
Expected: PASS (all describes).

- [ ] **Step 4: Create the config** — `src/apps/waypoint/index.ts`:

```ts
import { type MiniAppConfig } from "@/registry/types";
import WaypointScreen from "./Screen";

export const waypointApp: MiniAppConfig = {
  id: "waypoint",
  name: "Waypoint",
  description: "Marque um local e volte até ele com uma seta e a distância",
  category: "utilidades",
  icon: "MapPin",
  component: WaypointScreen,
  persistence: {
    enabled: true,
    storageKey: "waypoint-saved-points",
  },
};
```

- [ ] **Step 5: Register the app** — in `src/registry/index.ts`, add the import:
```ts
import { waypointApp } from "@/apps/waypoint";
```
and add `waypointApp,` as the last entry of the `appRegistry` array.

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/apps/waypoint src/registry`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/apps/waypoint src/registry/index.ts
git commit -m "feat(waypoint): add waypoint screen with GPS/heading and register app"
```

---

## Task 12: Full verification

- [ ] **Step 1: Run the whole test suite**

Run: `npx jest`
Expected: all suites pass (existing + new: conversor time/temp, bussola, nivel, waypoint).

- [ ] **Step 2: Typecheck and lint the whole project**

Run: `npx tsc --noEmit && npx eslint .`
Expected: no errors.

- [ ] **Step 3: Manual device verification (sensors cannot be tested in Jest)**

Run: `npx expo start` and open on a **physical device** (Expo Go). Verify:
- Conversor de Unidades → Tempo tab converts across all 5 units; Temperatura tab converts C↔F both directions.
- Bússola → dial rotates, degree + cardinal update as you turn.
- Nível → bubble moves, turns green when the phone is flat.
- Waypoint → grant location; "Marcar local aqui" saves a named point; selecting it shows a live arrow + distance that update as you move; delete works; points persist across app restart.

- [ ] **Step 4: Final commit (if any manual tweaks were needed)**

```bash
git add -A
git commit -m "chore: verification pass for new tools" || echo "nothing to commit"
```

---

## Self-review notes (author)

- **Spec coverage:** time converter (T1, T3), temperature converter (T2, T3), compass (T5–T6), bubble level (T7–T8), waypoint w/ multiple named points + persistence (T9–T11), deps + permissions + icons (T4). All spec sections mapped.
- **Type consistency:** `TimeUnit`, `Coord`, `Waypoint` defined once and reused; `headingFromMagnetometerSafe` defined in waypoint logic before its Screen import (T11 S2 pairs with S1's usage — implement S2 before running the app).
- **Icons:** `Compass`, `Crosshair`, `MapPin` added to `iconMap` in T4 before the apps that reference them (T6, T8, T11).
- **Ordering caveat:** Task 11 Step 1 writes the Screen that imports `headingFromMagnetometerSafe`; Step 2 adds that export. Do Steps 1–2 together before typechecking.
