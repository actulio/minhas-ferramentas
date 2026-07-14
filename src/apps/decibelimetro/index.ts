import { type MiniAppConfig } from "@/registry/types";
import DecibelimetroScreen from "./Screen";

export const decibelimetroApp: MiniAppConfig = {
  id: "decibelimetro",
  name: "Decibelímetro",
  description: "Estimativa do nível de ruído ambiente usando o microfone",
  category: "utilidades",
  icon: "Volume2",
  component: DecibelimetroScreen,
};
