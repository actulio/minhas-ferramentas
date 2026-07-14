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
