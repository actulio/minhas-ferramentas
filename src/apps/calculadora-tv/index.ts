import { type MiniAppConfig } from "@/registry/types";
import CalculadoraTvScreen from "./Screen";

export const calculadoraTvApp: MiniAppConfig = {
  id: "calculadora-tv",
  name: "Calculadora de Distância de TV",
  description: "Calcule o tamanho de TV ou distância ideal para sua sala",
  category: "utilidades",
  icon: "Tv",
  component: CalculadoraTvScreen,
};
