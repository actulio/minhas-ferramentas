import { type MiniAppConfig } from './types';
import { jurosCompostosApp } from '@/apps/juros-compostos';
import { pagamentoApp } from '@/apps/pagamento';

export const appRegistry: MiniAppConfig[] = [
  jurosCompostosApp,
  pagamentoApp,
];
