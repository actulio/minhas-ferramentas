import { type MiniAppConfig } from "@/registry/types";
import CambioScreen from "./Screen";

export const cambioApp: MiniAppConfig = {
  id: "cambio",
  name: "Conversor de Câmbio",
  description: "Converta entre BRL, USD, EUR e CHF em tempo real",
  category: "financas",
  icon: "ArrowLeftRight",
  component: CambioScreen,
  settings: [
    {
      key: "defaultCurrency",
      label: "Moeda padrão (campo inicial com foco)",
      type: "select",
      defaultValue: "USD",
      options: [
        { label: "Dólar Americano (USD)", value: "USD" },
        { label: "Euro (EUR)", value: "EUR" },
        { label: "Franco Suíço (CHF)", value: "CHF" },
        { label: "Real Brasileiro (BRL)", value: "BRL" },
      ],
    },
  ],
};
