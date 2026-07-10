import { type MiniAppConfig } from "@/registry/types";
import ComparadorPrecosScreen from "./Screen";

export const comparadorPrecosApp: MiniAppConfig = {
  id: "comparador-precos",
  name: "Comparador de Preços",
  description: "Compare dois produtos e descubra qual compensa mais por unidade",
  category: "utilidades",
  icon: "ShoppingCart",
  component: ComparadorPrecosScreen,
};
