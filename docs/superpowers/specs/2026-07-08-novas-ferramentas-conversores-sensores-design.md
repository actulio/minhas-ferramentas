# Design — Novas ferramentas: conversores de tempo/temperatura + apps de sensores

**Data:** 2026-07-08
**Projeto:** minhas-ferramentas (Expo Router + React Native, SDK 54)
**Status:** Aprovado — pronto para plano de implementação

## Objetivo

Adicionar 5 novas capacidades ao app:

1. **Conversor de tempo** (segundos, minutos, horas, dias, anos)
2. **Conversor de temperatura** (Celsius ↔ Fahrenheit)
3. **Bússola** (compass) — via magnetômetro
4. **Nível** (bubble level) — via acelerômetro
5. **Waypoint** (marcador de local / acha-carro / acha-trilha) — via GPS + magnetômetro

Os dois conversores são **novas abas** dentro do app existente `conversor-unidades`. Os três apps de sensores são **novos mini-apps** registrados na categoria **Utilidades**.

## Arquitetura existente (contexto)

- Padrão **plugin registry**: cada mini-app é uma pasta `src/apps/<slug>/` com `logic.ts` (funções puras), `logic.test.ts` (Jest), `Screen.tsx` (UI), `index.ts` (`MiniAppConfig`).
- Registro central: array em `src/registry/index.ts`.
- Categorias: `financas | utilidades | conversores` (`src/registry/types.ts`).
- Componentes compartilhados: `SegmentedControl`, `NumericInput`, `GlassCard`, `ResultDisplay`, `AppCard` (contém `iconMap` de lucide).
- Persistência: `MiniAppConfig.persistence { enabled, storageKey }` + helpers `loadJSON/saveJSON/removeItem` (`src/store/storage.ts`). Padrão de UI em `src/apps/pagamento/SavedItems.tsx`.
- Ícones: mapeados por nome (string lucide) em `AppCard.tsx` → `iconMap`.
- Tema: dark, `LinearGradient` de fundo, tokens em `src/theme/colors.ts`.
- Idioma: **Português apenas** (não há camada de i18n). Novas features seguem essa convenção; suporte a inglês fica fora de escopo (esforço separado).

## 1 + 2. Conversores de tempo e temperatura (dentro de `conversor-unidades`)

Adicionar duas abas ao array `tabs` do `Screen.tsx` existente:
`Volume | Pés/m | Pol/cm | Tempo | Temperatura`.

### Tempo
5 unidades não cabem bem no padrão pareado de dois campos. Portanto esta aba usa:
- 1 `NumericInput` para o valor
- um seletor de unidade de origem (segundos, minutos, horas, dias, anos)
- uma lista viva (`GlassCard`) mostrando o valor convertido nas outras 4 unidades

**Logic (`logic.ts`, com testes):**
- `TIME_FACTORS: Record<TimeUnit, number>` — fator de cada unidade para **segundos** (1 ano = 365 dias = 31_536_000 s, documentado como aproximação).
- `convertTime(value: number, from: TimeUnit, to: TimeUnit): number`
- `type TimeUnit = "s" | "min" | "h" | "d" | "ano"`

### Temperatura
Celsius ↔ Fahrenheit, dois campos bidirecionais (idêntico às abas existentes de comprimento). Fórmula com offset (sem fator compartilhado).

**Logic (`logic.ts`, com testes):**
- `cToF(c: number): number` → `c * 9/5 + 32`
- `fToC(f: number): number` → `(f - 32) * 5/9`

### Estado
Seguir o padrão atual: estado separado por aba (campo ativo + valor) para não misturar valores ao trocar de aba. `useMemo` para valores derivados.

### Testes adicionados a `logic.test.ts`
- Ida e volta de tempo (ex.: 3600 s = 1 h = 60 min).
- Conversões entre unidades não adjacentes (ex.: 2 anos → dias).
- Pontos de referência de temperatura: 0 °C = 32 °F, 100 °C = 212 °F, -40 °C = -40 °F.

**Sem novas dependências.** Sem alteração no registry.

## 3. Bússola — `src/apps/bussola/` (Utilidades)

**Dependência:** `expo-sensors` (Magnetometer). Sem permissão em runtime.

**Logic (`logic.ts`, com testes):**
- `headingFromMagnetometer(x: number, y: number): number` → ângulo 0–360° (`Math.atan2` normalizado).
- `cardinalPt(deg: number): string` → `N, NE, L, SE, S, SO, O, NO` (8 setores, rótulos pt-BR; L = Leste, O = Oeste).

**Screen (`Screen.tsx`):**
- Assina `Magnetometer.addListener`, define intervalo (~100 ms), remove no unmount.
- Mostra um disco/rosa dos ventos que gira conforme o heading, grau numérico e direção cardinal.
- Suavização simples opcional (low-pass) para reduzir tremor.

**MiniAppConfig:** `id: "bussola"`, categoria `utilidades`, ícone `Compass`.

## 4. Nível — `src/apps/nivel/` (Utilidades)

**Dependência:** `expo-sensors` (Accelerometer). Sem permissão.

**Logic (`logic.ts`, com testes):**
- `anglesFromAccelerometer(x, y, z): { pitch: number; roll: number }` — em graus.
- `isLevel(pitch: number, roll: number, toleranceDeg = 1): boolean`.

**Screen (`Screen.tsx`):**
- Assina o acelerômetro; move uma bolha (offset proporcional a pitch/roll) dentro de um círculo/tubo.
- Fica verde quando dentro da tolerância; mostra os ângulos numéricos.

**MiniAppConfig:** `id: "nivel"`, categoria `utilidades`, ícone (lucide, a definir na implementação — ex.: `Ruler` ou similar de alinhamento).

## 5. Waypoint — `src/apps/waypoint/` (Utilidades)

**Dependências:** `expo-location` (GPS) + `expo-sensors` (heading do magnetômetro).

**Múltiplos waypoints nomeados**, persistidos via `persistence`:
```
persistence: { enabled: true, storageKey: "waypoint-saved-points" }
```

**Logic (`logic.ts`, com testes):**
- `haversineDistance(a: Coord, b: Coord): number` → metros.
- `bearing(a: Coord, b: Coord): number` → rumo verdadeiro 0–360° de a para b.
- `arrowRotation(targetBearing: number, heading: number): number` → rotação relativa da seta (bearing − heading, normalizada).
- `formatDistance(m: number): string` → `"12 m"` / `"1,3 km"`.
- `type Coord = { latitude: number; longitude: number }`.

**Componente `SavedWaypoints.tsx`** (espelha `pagamento/SavedItems.tsx`): lista de waypoints nomeados, selecionar para navegar, excluir com confirmação (`Alert`).

**Screen (`Screen.tsx`):**
- Botão "Marcar local aqui" → pega posição atual (`getCurrentPositionAsync`), pede um nome, salva.
- Lista de waypoints salvos; ao selecionar um, assina posição (`watchPositionAsync`) + heading, e mostra uma **seta grande** apontando para o alvo + **distância** ao vivo.
- **Permissão:** `requestForegroundPermissionsAsync`; se negada, exibe estado explicativo com botão para tentar novamente (degradação graciosa, sem crash).

**MiniAppConfig:** `id: "waypoint"`, categoria `utilidades`, ícone `MapPin`.

## Alterações transversais

- **package.json:** adicionar `expo-sensors`, `expo-location` (ambos compatíveis com Expo Go; instalar com `npx expo install` para casar a versão do SDK).
- **app.json:** adicionar plugin `expo-location` com strings de permissão (iOS `NSLocationWhenInUseUsageDescription`; Android `ACCESS_FINE_LOCATION`).
- **`src/components/AppCard.tsx`:** adicionar ao `iconMap` os ícones novos (`Compass`, ícone de nível, `MapPin`).
- **`src/registry/index.ts`:** importar e adicionar `bussolaApp`, `nivelApp`, `waypointApp` ao array. (As abas do conversor não exigem mudança no registry.)

## Testes

- Toda a matemática vive em `logic.ts` de cada app com `logic.test.ts` correspondente (Jest / jest-expo já configurado).
- Cobertura: conversões (tempo/temperatura), `haversineDistance` (distâncias conhecidas), `bearing` (rumos conhecidos, ex.: norte = 0°), `cardinalPt`, `anglesFromAccelerometer`.
- Código de assinatura de sensores no `Screen.tsx` **não** é testado por unidade (efeito colateral); é verificado manualmente em dispositivo físico.

## Estratégia de entrega (fases sugeridas)

Commits/execução em fases, pois os apps de sensores só se verificam de verdade em dispositivo físico:

1. Conversores de tempo + temperatura (abas em `conversor-unidades`).
2. Bússola.
3. Nível.
4. Waypoint (o mais complexo — GPS + permissão + persistência).

## Fora de escopo

- Camada de i18n / suporte a inglês.
- Mapas visuais (o waypoint usa seta + distância, não um mapa embutido).
- Bússola com correção de declinação magnética / true-north via GPS (usa heading magnético; pode ser melhoria futura).
