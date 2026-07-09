import { type MiniAppConfig } from "@/registry/types";
import ConversorUnidadesScreen from "./Screen";

export const conversorUnidadesApp: MiniAppConfig = {
  id: "conversor-unidades",
  name: "Conversor de Unidades",
  description:
    "Converta volume, comprimento, tempo e temperatura",
  category: "conversores",
  icon: "Ruler",
  component: ConversorUnidadesScreen,
};
