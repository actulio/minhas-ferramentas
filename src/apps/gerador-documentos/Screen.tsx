import React, { useState, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { colors } from "@/theme/colors";
import { SegmentedControl } from "@/components/SegmentedControl";
import { GlassCard } from "@/components/GlassCard";
import { ResultDisplay } from "@/components/ResultDisplay";
import { generateCPF, generateCNPJ, validateCPF, validateCNPJ } from "./logic";

type MainTab = "generator" | "validator";
type DocType = "cpf" | "cnpj";

const mainTabs = [
  { label: "Gerador", value: "generator" },
  { label: "Validador", value: "validator" },
];

const docTypes = [
  { label: "CPF", value: "cpf" },
  { label: "CNPJ", value: "cnpj" },
];

export default function GeradorDocumentosScreen() {
  const [activeTab, setActiveTab] = useState<MainTab>("generator");

  // Generator State
  const [genDocType, setGenDocType] = useState<DocType>("cpf");
  const [formatDoc, setFormatDoc] = useState(true);
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [copied, setCopied] = useState(false);

  // Validator State
  const [valInput, setValInput] = useState("");

  const handleGenerate = () => {
    const doc =
      genDocType === "cpf" ? generateCPF(formatDoc) : generateCNPJ(formatDoc);
    setGeneratedDoc(doc);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!generatedDoc) return;
    await Clipboard.setStringAsync(generatedDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validationResult = useMemo(() => {
    const cleaned = valInput.replace(/\D/g, "");
    if (cleaned.length === 0) {
      return { status: "empty", message: "Digite um documento para validar" };
    }

    if (cleaned.length < 11) {
      return {
        status: "partial",
        message: "Aguardando mais dígitos para CPF...",
      };
    }

    if (cleaned.length === 11) {
      const isValid = validateCPF(cleaned);
      return {
        status: isValid ? "valid" : "invalid",
        message: isValid
          ? "CPF é matematicamente válido!"
          : "CPF inválido (dígitos verificadores incorretos)",
        type: "CPF",
      };
    }

    if (cleaned.length > 11 && cleaned.length < 14) {
      return {
        status: "partial",
        message: "Aguardando mais dígitos para CNPJ...",
      };
    }

    if (cleaned.length === 14) {
      const isValid = validateCNPJ(cleaned);
      return {
        status: isValid ? "valid" : "invalid",
        message: isValid
          ? "CNPJ é matematicamente Válido!"
          : "CNPJ Inválido (dígitos verificadores incorretos)",
        type: "CNPJ",
      };
    }

    return {
      status: "invalid",
      message: `Documento com tamanho inválido (${cleaned.length} dígitos)`,
    };
  }, [valInput]);

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: colors.text.accent,
            marginBottom: 8,
          }}
        >
          Ação:
        </Text>
        <SegmentedControl
          segments={mainTabs}
          selectedValue={activeTab}
          onSelect={(val) => setActiveTab(val as MainTab)}
        />

        {activeTab === "generator" ? (
          <View>
            <GlassCard style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: colors.text.accent,
                  marginBottom: 8,
                }}
              >
                Tipo de Documento:
              </Text>
              <SegmentedControl
                segments={docTypes}
                selectedValue={genDocType}
                onSelect={(val) => setGenDocType(val as DocType)}
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginVertical: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: colors.text.primary }}>
                  Formatar documento (pontos e traços)
                </Text>
                <Switch
                  value={formatDoc}
                  onValueChange={setFormatDoc}
                  trackColor={{
                    false: colors.text.muted,
                    true: colors.accent.start,
                  }}
                />
              </View>

              <Pressable
                onPress={handleGenerate}
                style={{
                  backgroundColor: colors.accent.start,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}
                >
                  Gerar Novo
                </Text>
              </Pressable>
            </GlassCard>

            {generatedDoc ? (
              <View style={{ marginBottom: 16 }}>
                <ResultDisplay
                  label={`Documento Gerado (${genDocType.toUpperCase()})`}
                  value={generatedDoc}
                />
                <Pressable
                  onPress={copyToClipboard}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: copied ? colors.success : colors.glass.bg,
                    borderWidth: 1,
                    borderColor: copied ? colors.success : colors.glass.border,
                    paddingVertical: 14,
                    borderRadius: 12,
                    marginTop: -6,
                  }}
                >
                  <Text
                    style={{
                      color: copied ? "#fff" : colors.text.primary,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {copied ? "Copiado!" : "Copiar para Área de Transferência"}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : (
          <View>
            <GlassCard style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: colors.text.accent,
                  marginBottom: 6,
                }}
              >
                Documento (CPF ou CNPJ)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.glass.bg,
                  borderWidth: 1,
                  borderColor: colors.glass.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <TextInput
                  value={valInput}
                  onChangeText={setValInput}
                  placeholder="Digite o número (com ou sem formatação)"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: colors.text.primary,
                    padding: 0,
                  }}
                />
              </View>
            </GlassCard>

            {validationResult.status !== "empty" && (
              <GlassCard
                style={{
                  borderColor:
                    validationResult.status === "valid"
                      ? colors.success
                      : validationResult.status === "invalid"
                        ? colors.error
                        : colors.glass.border,
                  backgroundColor:
                    validationResult.status === "valid"
                      ? "rgba(34, 197, 94, 0.08)"
                      : validationResult.status === "invalid"
                        ? "rgba(239, 68, 68, 0.08)"
                        : colors.glass.bg,
                }}
              >
                <Text
                  style={{
                    color:
                      validationResult.status === "valid"
                        ? colors.success
                        : validationResult.status === "invalid"
                          ? colors.error
                          : colors.text.secondary,
                    fontWeight: "600",
                    textAlign: "center",
                    fontSize: 15,
                  }}
                >
                  {validationResult.status === "valid"
                    ? "✓ "
                    : validationResult.status === "invalid"
                      ? "✗ "
                      : ""}
                  {validationResult.message}
                </Text>
              </GlassCard>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
