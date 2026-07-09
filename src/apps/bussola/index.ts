import { type MiniAppConfig } from "@/registry/types";
import BussolaScreen from "./Screen";

export const bussolaApp: MiniAppConfig = {
  id: "bussola",
  name: "Bússola",
  description: "Aponte para o norte com o magnetômetro do celular",
  category: "utilidades",
  icon: "Compass",
  component: BussolaScreen,
};
