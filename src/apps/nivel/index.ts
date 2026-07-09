import { type MiniAppConfig } from "@/registry/types";
import NivelScreen from "./Screen";

export const nivelApp: MiniAppConfig = {
  id: "nivel",
  name: "Nível",
  description: "Nível de bolha usando o acelerômetro do celular",
  category: "utilidades",
  icon: "Crosshair",
  component: NivelScreen,
};
