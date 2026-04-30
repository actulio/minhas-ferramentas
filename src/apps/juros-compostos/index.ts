import { type MiniAppConfig } from "@/registry/types";
import JurosCompostosScreen from "./Screen";

export const jurosCompostosApp: MiniAppConfig = {
  id: "juros-compostos",
  name: "Juros Compostos",
  description: "Calcule montante, capital, taxa ou período",
  category: "financas",
  icon: "TrendingUp",
  component: JurosCompostosScreen,
  settings: [
    {
      key: "defaultFrequency",
      label: "Frequência padrão",
      type: "select",
      defaultValue: 12,
      options: [
        { label: "Mensal", value: 12 },
        { label: "Trimestral", value: 4 },
        { label: "Semestral", value: 2 },
        { label: "Anual", value: 1 },
      ],
    },
  ],
};
