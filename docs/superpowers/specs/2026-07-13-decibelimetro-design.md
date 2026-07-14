# Decibelímetro — Design

## Objetivo

Novo mini-app que mostra o nível de ruído ambiente em tempo real, usando o
microfone do celular, com um medidor visual em arco (estilo SPL meter).

## Escopo

- Leitura ao vivo do nível sonoro, com suavização (EMA), exibida como número
  grande + arco radial colorido.
- Marcações de referência no arco (ex.: ambiente silencioso ~30dB, conversação
  ~60dB, trânsito ~85dB, risco auditivo ~100dB+).
- Aviso de que o valor é uma **estimativa** de dB(SPL), não uma medição
  calibrada — o microfone do celular não é um instrumento de precisão.
- Fora de escopo: histórico/estatísticas de sessão, calibração manual, medição
  em segundo plano, suporte à versão web (mostrar mensagem de "não suportado
  no navegador").

## Dependência nova

- `expo-audio` (substituto moderno de `expo-av`, compatível com Expo SDK 54).
  - `requestRecordingPermissionsAsync()` para permissão do microfone.
  - `useAudioRecorder(options)` + `useAudioRecorderState(recorder, intervalMs)`
    com `isMeteringEnabled: true` para ler o nível em dBFS periodicamente
    (intervalo customizado, mais curto que o padrão de 500ms, para o medidor
    parecer responsivo).
- Adicionar `NSMicrophoneUsageDescription` (iOS) e permissão `RECORD_AUDIO`
  (Android) no `app.json`.

## Estrutura de arquivos

```
src/apps/decibelimetro/
├── logic.ts          # funções puras
├── logic.test.ts      # testes das funções puras
├── Screen.tsx          # UI, permissão, gravação, arco SVG
└── index.ts            # MiniAppConfig
```

### `logic.ts`

- `dbfsToSplEstimate(dbfs: number): number` — aplica offset fixo e faz clamp
  para uma faixa realista (~30–120 dB).
- `splToArcProgress(db: number): number` — mapeia dB para posição (0–1) no
  arco.
- `splToZoneColor(db: number): string` — mapeia dB para cor (calmo/moderado/
  alto).
- `smooth(previous: number, next: number, factor: number): number` — média
  móvel exponencial, mesmo padrão usado em `bussola`/`nivel`.

### `Screen.tsx`

- Ao montar: solicita permissão de gravação; se negada, mostra estado com
  botão para abrir Configurações do sistema.
- Se concedida: inicia gravador com metering habilitado, faz polling do
  `metering` (dBFS) via `useAudioRecorderState`, converte para estimativa de
  SPL e suaviza antes de exibir.
- Renderiza arco radial com `react-native-svg` (já é dependência do projeto),
  número central grande, marcações de referência, aviso de estimativa.
- Web: mostra mensagem de "não suportado no navegador" em vez de tentar gravar.
- Cleanup do gravador ao desmontar (parar e liberar), seguindo o padrão de
  cleanup de sensores já usado em `bussola`/`waypoint`.

### `index.ts`

```ts
export const decibelimetroApp: MiniAppConfig = {
  id: "decibelimetro",
  name: "Decibelímetro",
  description: "Estimativa do nível de ruído ambiente usando o microfone",
  category: "utilidades",
  icon: "Volume2",
  component: DecibelimetroScreen,
};
```

## Registro

- Adicionar `decibelimetroApp` em `src/registry/index.ts`.
- Registrar ícone `Volume2` no `iconMap` de `src/components/AppCard.tsx`.
- Adicionar linha na tabela "Utilidades" do `README.md`.

## Testes

- `logic.test.ts` cobre conversão dBFS→SPL estimado, clamp de faixa, mapeamento
  para progresso do arco, mapeamento de cor por zona, e suavização (EMA).
- UI não é testada automaticamente (padrão do projeto — Screens não têm
  testes, só a lógica pura).
