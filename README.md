# 🛠️ Minhas Ferramentas

Aplicativo mobile de ferramentas financeiras pessoais, construído com React Native e Expo. Possui uma arquitetura de **plugin registry** que permite adicionar novas mini-apps de forma modular.

## 📱 Mini-Apps Incluídas

| App | Descrição |
|-----|-----------|
| **Juros Compostos** | Calculadora que resolve qualquer variável da fórmula de juros compostos (montante, capital, taxa, período ou frequência) |
| **À Vista vs À Prazo** | Compara o custo efetivo entre pagar à vista ou parcelado, considerando rendimento de investimentos e cashback |
| **Conversor de Câmbio** | Conversão em tempo real entre BRL, USD, EUR e CHF com cache de cotações |

## 🏗️ Arquitetura

```
minhas-ferramentas/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout (Inter font + splash)
│   ├── +not-found.tsx            # 404 screen
│   ├── (tabs)/                   # Bottom tab navigation
│   │   ├── _layout.tsx           # 3-tab bar (Início, Favoritos, Ajustes)
│   │   ├── index.tsx             # Home — lista de apps com busca
│   │   ├── favoritos.tsx         # Favoritos persistidos
│   │   └── ajustes.tsx           # Configurações por app
│   ├── app/[id].tsx              # Tela dinâmica de mini-app
│   └── settings/[id].tsx         # Tela dinâmica de configuração
│
├── src/
│   ├── registry/                 # Plugin registry
│   │   ├── types.ts              # Interface MiniAppConfig
│   │   └── index.ts              # Registro central das apps
│   ├── theme/
│   │   └── colors.ts             # Paleta midnight-blue
│   ├── store/                    # Estado global (Zustand + AsyncStorage)
│   │   ├── storage.ts            # Helpers para AsyncStorage
│   │   ├── favorites.ts          # Store de favoritos
│   │   └── settings.ts           # Store de configurações
│   ├── components/               # UI compartilhada
│   │   ├── GlassCard.tsx         # Container glassmorphism
│   │   ├── AppCard.tsx           # Card de app com animação
│   │   ├── CategoryDivider.tsx   # Divisor de categorias
│   │   ├── ResultDisplay.tsx     # Exibição de resultado com gradiente
│   │   ├── NumericInput.tsx      # Input numérico estilizado
│   │   └── SegmentedControl.tsx  # Controle segmentado
│   └── apps/                     # Mini-apps (isoladas)
│       ├── juros-compostos/
│       │   ├── logic.ts          # Funções matemáticas puras
│       │   ├── logic.test.ts     # 16 testes
│       │   ├── Screen.tsx        # UI da calculadora
│       │   └── index.ts          # MiniAppConfig
│       ├── pagamento/
│       │   ├── logic.ts          # Comparação à vista vs à prazo
│       │   ├── logic.test.ts     # 7 testes
│       │   ├── SavedItems.tsx    # Lista de comparações salvas
│       │   ├── Screen.tsx        # UI com save/load
│       │   └── index.ts          # MiniAppConfig
│       └── cambio/
│           ├── logic.ts          # Conversão de moedas
│           ├── logic.test.ts     # 7 testes
│           ├── api.ts            # Fetch de cotações com cache
│           ├── api.test.ts       # 5 testes
│           ├── Screen.tsx        # UI com 4 inputs simultâneos
│           └── index.ts          # MiniAppConfig
```

### Plugin Registry

Cada mini-app é um módulo isolado que exporta um `MiniAppConfig`:

```ts
export interface MiniAppConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;              // Nome do ícone Lucide
  component: React.ComponentType;
  settings?: SettingField[];
  persistence?: { enabled: boolean; storageKey: string };
}
```

Para adicionar uma nova app, basta criar o módulo em `src/apps/` e registrá-lo em `src/registry/index.ts`. A home screen, favoritos e ajustes se adaptam automaticamente.

## 🚀 Como Rodar

### Pré-requisitos

- **Node.js** ≥ 18
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Expo CLI** (instalado via `npx`)
- **Expo Go** no celular (iOS/Android) ou um emulador configurado

### Instalação

```bash
# Clonar e instalar dependências
cd minhas-ferramentas
pnpm install
```

### Configurar variáveis de ambiente

```bash
# Copiar o template
cp .env.example .env
```

O arquivo `.env.example` contém as variáveis necessárias:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `EXPO_PUBLIC_EXCHANGE_API_KEY` | ✅ | Chave da [ExchangeRate-API](https://www.exchangerate-api.com/) (gratuita, 1500 req/mês) |

```bash
# Editar o .env com sua chave
EXPO_PUBLIC_EXCHANGE_API_KEY=sua_chave_aqui
```

> **Nota:** Crie uma conta gratuita em [exchangerate-api.com](https://www.exchangerate-api.com/) para obter sua chave.

### Rodar o app

```bash
# Iniciar o servidor de desenvolvimento
pnpm start

# Ou diretamente para uma plataforma:
pnpm run ios
pnpm run android
pnpm run web
```

Escaneie o QR code com o Expo Go ou pressione `i` (iOS) / `a` (Android) no terminal.

### Rodar os testes

```bash
# Rodar todos os testes (37 testes em 4 suites)
pnpm test

# Com output detalhado
pnpm exec jest --verbose

# Rodar testes de uma app específica
pnpm exec jest src/apps/juros-compostos/
pnpm exec jest src/apps/pagamento/
pnpm exec jest src/apps/cambio/
```

### Linting e Formatação

```bash
# Verificar erros de lint
pnpm run lint

# Corrigir erros automaticamente
pnpm run lint:fix

# Formatar código com Prettier
pnpm run format

# Verificar formatação (CI)
pnpm run format:check
```

### Verificação TypeScript

```bash
npx tsc --noEmit
```

## 🎨 Design

O app utiliza uma linguagem visual **midnight-blue com glassmorphism**:

| Token | Valor | Uso |
|-------|-------|-----|
| `bg.start` | `#020617` | Fundo principal |
| `bg.mid` | `#0c1a3d` | Gradiente intermediário |
| `bg.end` | `#091525` | Gradiente final |
| `accent.start` | `#3b82f6` | Azul primário |
| `glass.bg` | `rgba(59,130,246,0.08)` | Fundo dos cards |
| `glass.border` | `rgba(59,130,246,0.15)` | Borda dos cards |

- **Tipografia**: Inter (Regular, Medium, SemiBold, Bold)
- **Animações**: Spring scale nos cards via Reanimated
- **Idioma**: Português brasileiro

## 🧰 Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Expo | 54 | Framework e tooling |
| React Native | 0.81 | Runtime mobile |
| React | 19 | UI framework |
| Expo Router | 5 | Navegação file-based |
| Zustand | 5 | Estado global |
| AsyncStorage | — | Persistência local |
| Reanimated | 3 | Animações nativas |
| Jest + jest-expo | — | Testes unitários |
| ESLint + Prettier | — | Linting e formatação |
| lucide-react-native | 1.x | Ícones |

## 📋 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `start` | `pnpm start` | Inicia o Expo dev server |
| `ios` | `pnpm run ios` | Abre no simulador iOS |
| `android` | `pnpm run android` | Abre no emulador Android |
| `test` | `pnpm test` | Roda os testes com Jest |
| `lint` | `pnpm run lint` | Verifica erros de lint |
| `lint:fix` | `pnpm run lint:fix` | Corrige erros de lint |
| `format` | `pnpm run format` | Formata com Prettier |
| `format:check` | `pnpm run format:check` | Verifica formatação |
