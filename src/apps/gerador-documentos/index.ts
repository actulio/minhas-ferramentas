import { type MiniAppConfig } from "@/registry/types";
import GeradorDocumentosScreen from "./Screen";

export const geradorDocumentosApp: MiniAppConfig = {
  id: "gerador-documentos",
  name: "Gerador e Validador de CPF/CNPJ",
  description: "Valide documentos ou gere novos CPFs e CNPJs válidos",
  category: "utilidades",
  icon: "IdCard",
  component: GeradorDocumentosScreen,
};
