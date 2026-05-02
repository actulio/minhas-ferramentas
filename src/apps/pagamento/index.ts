import { type MiniAppConfig } from "@/registry/types";
import PagamentoScreen from "./Screen";

export const pagamentoApp: MiniAppConfig = {
  id: "pagamento",
  name: "À Vista vs À Prazo",
  description: "Compare formas de pagamento e descubra a melhor opção",
  category: "financas",
  icon: "CreditCard",
  component: PagamentoScreen,
  persistence: {
    enabled: true,
    storageKey: "pagamento-saved-items",
  },
  settings: [
    {
      key: "defaultMonthlyReturn",
      label: "Rendimento mensal padrão (%)",
      type: "number",
      defaultValue: 1,
    },
    {
      key: "defaultCashbackRate",
      label: "Cashback padrão (%)",
      type: "number",
      defaultValue: 1.0,
    },
  ],
};
