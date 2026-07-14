# Decibelímetro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Decibelímetro" mini-app to `minhas-ferramentas` that shows an estimated ambient noise level (dB) in real time using the phone's microphone, displayed as a radial arc gauge.

**Architecture:** Follows the existing plugin-registry pattern used by `bussola`/`nivel`/`waypoint`: a `src/apps/decibelimetro/` module with pure-function `logic.ts` (+ tests), a `Screen.tsx` that owns permission/recording state and renders an SVG arc gauge, and an `index.ts` exporting a `MiniAppConfig`. Registered centrally in `src/registry/index.ts`.

**Tech Stack:** Expo SDK 54, React Native, `expo-audio` (new dependency, metering-enabled recorder), `react-native-svg` (already a dependency, used here for the first time to draw an arc), Jest for pure-function tests.

Spec: `docs/superpowers/specs/2026-07-13-decibelimetro-design.md`

---

### Task 1: Add `expo-audio` dependency and microphone permission config

**Files:**
- Modify: `package.json`
- Modify: `app.json`

- [ ] **Step 1: Install the dependency via Expo's compatibility-aware installer**

Run: `cd /Users/work/personal/random/minhas-ferramentas && npx expo install expo-audio`

Expected: `package.json` gets a new `"expo-audio": "~X.Y.Z"` entry (Expo picks the version compatible with SDK 54), and `pnpm-lock.yaml` updates.

- [ ] **Step 2: Register the `expo-audio` config plugin with a Portuguese microphone permission message**

In `app.json`, add an entry to the `expo.plugins` array (alongside the existing `expo-location` entry):

```json
      [
        "expo-audio",
        {
          "microphonePermission": "Este app usa o microfone para estimar o nível de ruído ambiente."
        }
      ]
```

The full `plugins` array becomes:

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
      ],
      [
        "expo-audio",
        {
          "microphonePermission": "Este app usa o microfone para estimar o nível de ruído ambiente."
        }
      ]
    ],
```

This plugin automatically sets `NSMicrophoneUsageDescription` on iOS and adds `RECORD_AUDIO` on Android — no other `app.json` changes are needed.

- [ ] **Step 3: Verify the app still boots**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors (the dependency is installed but not yet imported anywhere).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml app.json
git commit -m "chore(decibelimetro): add expo-audio dependency and mic permission config"
```

---

### Task 2: Gauge geometry and dB-mapping pure functions

**Files:**
- Create: `src/apps/decibelimetro/logic.ts`
- Create: `src/apps/decibelimetro/logic.test.ts`

- [ ] **Step 1: Write failing tests for the arc geometry helpers**

Create `src/apps/decibelimetro/logic.test.ts` with:

```ts
import {
  polarToCartesian,
  describeArc,
  dbfsToSplEstimate,
  splToArcProgress,
  splToZone,
  smooth,
  MIN_DB,
  MAX_DB,
} from "./logic";

describe("polarToCartesian", () => {
  it("returns the rightmost point at angle 0", () => {
    const { x, y } = polarToCartesian(0, 0, 10, 0);
    expect(x).toBeCloseTo(10);
    expect(y).toBeCloseTo(0);
  });

  it("returns the bottom point at angle 90 (SVG y grows downward)", () => {
    const { x, y } = polarToCartesian(0, 0, 10, 90);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(10);
  });

  it("offsets from a non-zero center", () => {
    const { x, y } = polarToCartesian(5, 5, 10, 0);
    expect(x).toBeCloseTo(15);
    expect(y).toBeCloseTo(5);
  });
});

describe("describeArc", () => {
  it("starts at the start-angle point and ends at the end-angle point", () => {
    const start = polarToCartesian(0, 0, 10, 135);
    const end = polarToCartesian(0, 0, 10, 405);
    const d = describeArc(0, 0, 10, 135, 405);
    expect(d).toBe(`M ${start.x} ${start.y} A 10 10 0 1 1 ${end.x} ${end.y}`);
  });

  it("uses large-arc-flag=0 for a sweep of 90 degrees", () => {
    const d = describeArc(0, 0, 10, 0, 90);
    expect(d).toContain("A 10 10 0 0 1");
  });

  it("uses large-arc-flag=1 for a sweep greater than 180 degrees", () => {
    const d = describeArc(0, 0, 10, 135, 405);
    expect(d).toContain("A 10 10 0 1 1");
  });

  it("uses large-arc-flag=0 for a zero-degree sweep", () => {
    const d = describeArc(0, 0, 10, 135, 135);
    expect(d).toContain("A 10 10 0 0 1");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec jest src/apps/decibelimetro/ -v`
Expected: FAIL — `Cannot find module './logic'`.

- [ ] **Step 3: Implement the geometry helpers in `logic.ts`**

Create `src/apps/decibelimetro/logic.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify the geometry tests pass**

Run: `pnpm exec jest src/apps/decibelimetro/ -v`
Expected: PASS for all `polarToCartesian` and `describeArc` tests; the remaining tests (not yet written) don't exist yet so only these run.

- [ ] **Step 5: Commit**

```bash
git add src/apps/decibelimetro/logic.ts src/apps/decibelimetro/logic.test.ts
git commit -m "feat(decibelimetro): add arc-gauge geometry helpers"
```

- [ ] **Step 6: Write failing tests for the dB-mapping functions**

Append to `src/apps/decibelimetro/logic.test.ts`:

```ts
describe("dbfsToSplEstimate", () => {
  it("maps silence-level dBFS to the low end of the SPL range", () => {
    expect(dbfsToSplEstimate(-160)).toBe(MIN_DB);
  });

  it("maps 0 dBFS (loudest possible input) using the fixed offset", () => {
    // 0 dBFS + the 100dB offset = 100. MAX_DB (120) is a safety ceiling for
    // clamping outliers, not something 0 dBFS reaches on its own.
    expect(dbfsToSplEstimate(0)).toBe(100);
  });

  it("applies the fixed offset for a mid-range value", () => {
    expect(dbfsToSplEstimate(-40)).toBe(60);
  });
});

describe("splToArcProgress", () => {
  it("is 0 at the minimum dB", () => {
    expect(splToArcProgress(MIN_DB)).toBe(0);
  });

  it("is 1 at the maximum dB", () => {
    expect(splToArcProgress(MAX_DB)).toBe(1);
  });

  it("is 0.5 at the midpoint", () => {
    expect(splToArcProgress((MIN_DB + MAX_DB) / 2)).toBeCloseTo(0.5);
  });

  it("clamps values above the maximum", () => {
    expect(splToArcProgress(MAX_DB + 50)).toBe(1);
  });
});

describe("splToZone", () => {
  it("is calmo below 60dB", () => {
    expect(splToZone(45)).toBe("calmo");
  });

  it("is moderado between 60 and 85dB", () => {
    expect(splToZone(70)).toBe("moderado");
  });

  it("is alto at 85dB and above", () => {
    expect(splToZone(90)).toBe("alto");
  });
});

describe("smooth", () => {
  it("moves partway from prev toward next", () => {
    expect(smooth(0, 10, 0.5)).toBe(5);
  });

  it("stays put when prev equals next", () => {
    expect(smooth(10, 10, 0.3)).toBe(10);
  });
});
```

- [ ] **Step 7: Run the tests to verify the new ones fail**

Run: `pnpm exec jest src/apps/decibelimetro/ -v`
Expected: FAIL — `dbfsToSplEstimate`, `splToArcProgress`, `splToZone`, `smooth` are not exported yet.

- [ ] **Step 8: Implement the dB-mapping functions**

Append to `src/apps/decibelimetro/logic.ts`:

```ts
export const MIN_DB = 30;
export const MAX_DB = 120;
export const START_ANGLE = 135;
export const SWEEP_DEGREES = 270;

// Phone mics aren't calibrated instruments. This fixed offset converts the
// raw dBFS metering value (roughly -160 silence .. 0 loudest-possible-input)
// into a rough dB(SPL) estimate so the number lines up with everyday
// comparisons (quiet room ~30dB, conversation ~60dB, traffic ~85dB).
const DBFS_TO_SPL_OFFSET = 100;

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
```

- [ ] **Step 9: Run the tests to verify everything passes**

Run: `pnpm exec jest src/apps/decibelimetro/ -v`
Expected: PASS — all tests in the file green (19 tests).

- [ ] **Step 10: Commit**

```bash
git add src/apps/decibelimetro/logic.ts src/apps/decibelimetro/logic.test.ts
git commit -m "feat(decibelimetro): add dB estimation, zone and reference-point logic"
```

---

### Task 3: Build the Screen UI

**Files:**
- Create: `src/apps/decibelimetro/Screen.tsx`

- [ ] **Step 1: Write the Screen component**

Create `src/apps/decibelimetro/Screen.tsx`:

```tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import {
  MIN_DB,
  START_ANGLE,
  SWEEP_DEGREES,
  REFERENCE_POINTS,
  dbfsToSplEstimate,
  splToArcProgress,
  splToZone,
  polarToCartesian,
  describeArc,
  smooth,
  type NoiseZone,
} from "./logic";

const RADIUS = 130;
const STROKE_WIDTH = 16;
const SIZE = RADIUS * 2 + STROKE_WIDTH * 2;
const CENTER = SIZE / 2;
const POLL_INTERVAL_MS = 120;

const zoneColor: Record<NoiseZone, string> = {
  calmo: colors.success,
  moderado: colors.warning,
  alto: colors.error,
};

const recordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export default function DecibelimetroScreen() {
  const [permission, setPermission] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");
  const [db, setDb] = useState(MIN_DB);
  const smoothedRef = useRef(MIN_DB);
  const recorder = useAudioRecorder(recordingOptions);
  const recorderState = useAudioRecorderState(recorder, POLL_INTERVAL_MS);

  // Request mic permission and start metering-enabled recording on mount.
  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (cancelled) return;
      if (!status.granted) {
        setPermission("denied");
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      setPermission("granted");
      await recorder.prepareToRecordAsync();
      recorder.record();
    })();
    return () => {
      cancelled = true;
      recorder.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert each metering poll into a smoothed SPL estimate.
  useEffect(() => {
    if (recorderState.metering === undefined) return;
    const estimate = dbfsToSplEstimate(recorderState.metering);
    const next = smooth(smoothedRef.current, estimate, 0.3);
    smoothedRef.current = next;
    setDb(next);
  }, [recorderState.metering]);

  if (Platform.OS === "web") {
    return (
      <LinearGradient
        colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}
      >
        <Text style={{ color: colors.text.primary, fontSize: 16, textAlign: "center" }}>
          O decibelímetro não é suportado no navegador. Abra o app no celular
          para medir o ruído ambiente.
        </Text>
      </LinearGradient>
    );
  }

  if (permission === "denied") {
    return (
      <LinearGradient
        colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}
      >
        <Text
          style={{
            color: colors.text.primary,
            fontSize: 16,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Permissão de microfone negada. Habilite o acesso ao microfone nas
          configurações do sistema para usar o decibelímetro.
        </Text>
        <Pressable
          onPress={async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            setPermission(status.granted ? "granted" : "denied");
          }}
          style={{
            backgroundColor: colors.accent.start,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Tentar novamente</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  const progress = splToArcProgress(db);
  const zone = splToZone(db);
  const endAngle = START_ANGLE + SWEEP_DEGREES * progress;
  const trackPath = describeArc(
    CENTER,
    CENTER,
    RADIUS,
    START_ANGLE,
    START_ANGLE + SWEEP_DEGREES,
  );
  const progressPath = describeArc(CENTER, CENTER, RADIUS, START_ANGLE, endAngle);

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
    >
      <View style={{ width: SIZE, height: SIZE, justifyContent: "center", alignItems: "center" }}>
        <Svg width={SIZE} height={SIZE} style={{ position: "absolute" }}>
          <Path
            d={trackPath}
            stroke={colors.glass.border}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={progressPath}
            stroke={zoneColor[zone]}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>

        {REFERENCE_POINTS.map((ref) => {
          const angle = START_ANGLE + SWEEP_DEGREES * splToArcProgress(ref.db);
          const point = polarToCartesian(CENTER, CENTER, RADIUS + STROKE_WIDTH, angle);
          return (
            <Text
              key={ref.db}
              style={{
                position: "absolute",
                left: point.x - 24,
                top: point.y - 8,
                width: 48,
                fontSize: 10,
                color: colors.text.muted,
                textAlign: "center",
              }}
            >
              {ref.label}
            </Text>
          );
        })}

        <Text style={{ fontSize: 48, fontWeight: "700", color: colors.text.primary }}>
          {Math.round(db)}
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>
          dB (estimado)
        </Text>
      </View>

      <GlassCard style={{ marginTop: 24, maxWidth: 280 }}>
        <Text style={{ fontSize: 12, color: colors.text.muted, textAlign: "center" }}>
          Estimativa baseada no microfone do celular. Não substitui um medidor
          de SPL calibrado.
        </Text>
      </GlassCard>
    </LinearGradient>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. If `expo-audio`'s exported types don't match (e.g. `AudioModule.requestRecordingPermissionsAsync` or `setAudioModeAsync` signatures), fix the import/usage to match what `tsc` reports — the installed version is the source of truth over this plan.

- [ ] **Step 3: Commit**

```bash
git add src/apps/decibelimetro/Screen.tsx
git commit -m "feat(decibelimetro): add radial arc-gauge screen with mic metering"
```

---

### Task 4: Export the `MiniAppConfig`

**Files:**
- Create: `src/apps/decibelimetro/index.ts`

- [ ] **Step 1: Create the config module**

Create `src/apps/decibelimetro/index.ts`:

```ts
import { type MiniAppConfig } from "@/registry/types";
import DecibelimetroScreen from "./Screen";

export const decibelimetroApp: MiniAppConfig = {
  id: "decibelimetro",
  name: "Decibelímetro",
  description: "Estimativa do nível de ruído ambiente usando o microfone",
  category: "utilidades",
  icon: "Volume2",
  component: DecibelimetroScreen,
};
```

- [ ] **Step 2: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/apps/decibelimetro/index.ts
git commit -m "feat(decibelimetro): export MiniAppConfig"
```

---

### Task 5: Register the app (registry, icon, README)

**Files:**
- Modify: `src/registry/index.ts`
- Modify: `src/components/AppCard.tsx`
- Modify: `README.md`

- [ ] **Step 1: Register in the app registry**

Modify `src/registry/index.ts` — add the import and list entry:

```ts
import { type MiniAppConfig } from "./types";
import { jurosCompostosApp } from "@/apps/juros-compostos";
import { pagamentoApp } from "@/apps/pagamento";
import { cambioApp } from "@/apps/cambio";
import { conversorUnidadesApp } from "@/apps/conversor-unidades";
import { calculadoraTvApp } from "@/apps/calculadora-tv";
import { geradorDocumentosApp } from "@/apps/gerador-documentos";
import { comparadorPrecosApp } from "@/apps/comparador-precos";
import { bussolaApp } from "@/apps/bussola";
import { nivelApp } from "@/apps/nivel";
import { waypointApp } from "@/apps/waypoint";
import { decibelimetroApp } from "@/apps/decibelimetro";

export const appRegistry: MiniAppConfig[] = [
  jurosCompostosApp,
  pagamentoApp,
  cambioApp,
  conversorUnidadesApp,
  calculadoraTvApp,
  geradorDocumentosApp,
  comparadorPrecosApp,
  bussolaApp,
  nivelApp,
  waypointApp,
  decibelimetroApp,
];
```

- [ ] **Step 2: Register the `Volume2` icon**

Modify `src/components/AppCard.tsx` — add `Volume2` to the lucide import and to `iconMap`:

```ts
import {
  TrendingUp,
  CreditCard,
  ArrowLeftRight,
  Heart,
  Compass,
  Crosshair,
  MapPin,
  ShoppingCart,
  Tv,
  Ruler,
  IdCard,
  Volume2,
  type LucideProps,
} from "lucide-react-native";
```

```ts
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  TrendingUp,
  CreditCard,
  ArrowLeftRight,
  Compass,
  Crosshair,
  MapPin,
  ShoppingCart,
  Tv,
  Ruler,
  IdCard,
  Volume2,
};
```

- [ ] **Step 3: Add a row to the README's "Utilidades" table**

Modify `README.md` — in the `### Utilidades` table, add:

```
| **Decibelímetro** | Estimativa do nível de ruído ambiente usando o microfone do celular, com medidor visual em arco |
```

so the table reads:

```
### Utilidades
| App | Descrição |
|-----|-----------|
| **Gerador de Documentos** | Gera CPF/CNPJ válidos para testes |
| **Comparador de Preços** | Compara dois produtos com quantidades/unidades diferentes e mostra qual tem o menor preço por unidade (peso, volume ou contagem) |
| **Bússola** | Aponta para o norte usando o magnetômetro do celular |
| **Nível** | Nível de bolha usando o acelerômetro do celular |
| **Waypoint** | Marca um local (GPS) e guia você de volta com uma seta e a distância — acha-carro / acha-trilha, com vários locais nomeados |
| **Decibelímetro** | Estimativa do nível de ruído ambiente usando o microfone do celular, com medidor visual em arco |
```

- [ ] **Step 4: Type-check and lint**

Run: `pnpm exec tsc --noEmit && pnpm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/registry/index.ts src/components/AppCard.tsx README.md
git commit -m "feat(decibelimetro): register app, icon and README entry"
```

---

### Task 6: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: all suites pass, including the new `src/apps/decibelimetro/logic.test.ts` (19 tests).

- [ ] **Step 2: Run lint and format checks**

Run: `pnpm run lint && pnpm run format:check`
Expected: no errors. If `format:check` fails, run `pnpm run format` and re-check.

- [ ] **Step 3: Type-check the whole project**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual on-device/simulator check**

Run: `pnpm start` and open the app (Expo Go or a dev build — note that a dev build is required if `expo-audio`'s native module isn't present in the installed Expo Go version; check the terminal output from `pnpm start` for a warning about that).

Checklist:
- Open "Decibelímetro" from the home screen.
- Confirm the mic-permission prompt appears, and granting it starts the live gauge.
- Confirm blowing/tapping near the mic visibly moves the arc and number.
- Deny permission (or revoke it in system settings and reopen) and confirm the denied-state screen with retry button appears.
- Confirm leaving the screen (navigating back) doesn't leave the mic recording in the background (check the OS mic-in-use indicator disappears).

- [ ] **Step 5: Commit any fixes found during manual verification**

If Step 4 turns up issues, fix them and commit:

```bash
git add -A
git commit -m "fix(decibelimetro): <describe the fix>"
```

If no issues, no commit is needed for this task.
