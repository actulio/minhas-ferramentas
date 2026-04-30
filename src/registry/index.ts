import { type MiniAppConfig } from "./types";
import { jurosCompostosApp } from "@/apps/juros-compostos";
import { pagamentoApp } from "@/apps/pagamento";
import { cambioApp } from "@/apps/cambio";

export const appRegistry: MiniAppConfig[] = [
  jurosCompostosApp,
  pagamentoApp,
  cambioApp,
];
