import { type MiniAppConfig } from "@/registry/types";
import ConversorUnidadesScreen from "./Screen";

export const conversorUnidadesApp: MiniAppConfig = {
  id: "conversor-unidades",
  name: "Conversor de Unidades",
  description:
    "Converta ml para oz, pés para metros e polegadas para centímetros",
  category: "conversores",
  icon: "Ruler",
  component: ConversorUnidadesScreen,
};
