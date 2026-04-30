import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RefreshCw } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { useSettingsStore } from "@/store/settings";
import { getRates } from "./api";
import {
  convertAll,
  currencyInfo,
  foreignCurrencies,
  type CurrencyCode,
  type ExchangeRates,
} from "./logic";

const allCurrencies: CurrencyCode[] = ["BRL", ...foreignCurrencies];

export default function CambioScreen() {
  const defaultCurrency = useSettingsStore((s) =>
    s.getSetting("cambio", "defaultCurrency"),
  ) as string;

  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesInfo, setRatesInfo] = useState<{
    fetchedAt: Date;
    isStale: boolean;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Which currency the user is typing in, and the raw text value
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>(
    (defaultCurrency as CurrencyCode) || "USD",
  );
  const [activeAmount, setActiveAmount] = useState("");

  const fetchRates = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRates(force);
      setRates(result.rates);
      setRatesInfo({
        fetchedAt: result.fetchedAt,
        isStale: result.isStale,
        error: result.error,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao buscar cotações");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const converted = useMemo(() => {
    if (!rates) return null;
    const amount = parseFloat(activeAmount) || 0;
    if (amount === 0) return null;
    return convertAll(amount, activeCurrency, rates);
  }, [rates, activeAmount, activeCurrency]);

  const handleCurrencyInput = (currency: CurrencyCode, text: string) => {
    setActiveCurrency(currency);
    setActiveAmount(text);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (loading && !rates) {
    return (
      <LinearGradient
        colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator color={colors.accent.start} size="large" />
        <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
          Carregando cotações...
        </Text>
      </LinearGradient>
    );
  }

  if (error && !rates) {
    return (
      <LinearGradient
        colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            color: colors.error,
            fontSize: 16,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {error}
        </Text>
        <Pressable
          onPress={() => fetchRates(true)}
          style={{
            backgroundColor: colors.accent.start,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Tentar novamente
          </Text>
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Timestamp + refresh */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <View>
            {ratesInfo ? (
              <>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  Atualizado em: {formatTime(ratesInfo.fetchedAt)}
                </Text>
                {ratesInfo.isStale ? (
                  <Text
                    style={{
                      color: colors.warning,
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    ⚠ {ratesInfo.error}
                  </Text>
                ) : null}
              </>
            ) : null}
          </View>
          <Pressable
            onPress={() => fetchRates(true)}
            style={{ padding: 8 }}
            disabled={loading}
          >
            <RefreshCw
              color={loading ? colors.text.muted : colors.accent.start}
              size={20}
            />
          </Pressable>
        </View>

        {/* Currency rows */}
        {allCurrencies.map((code) => {
          const info = currencyInfo[code];
          const isActive = code === activeCurrency;
          const displayValue = isActive
            ? activeAmount
            : converted
              ? converted[code].toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "";

          return (
            <GlassCard
              key={code}
              style={{
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                borderColor: isActive
                  ? colors.accent.start
                  : colors.glass.border,
              }}
            >
              <Text style={{ fontSize: 28, marginRight: 12 }}>{info.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text.primary,
                  }}
                >
                  {code}
                </Text>
                <Text style={{ fontSize: 11, color: colors.text.secondary }}>
                  {info.name}
                </Text>
              </View>
              <TextInput
                value={displayValue}
                onChangeText={(text) => handleCurrencyInput(code, text)}
                onFocus={() => {
                  setActiveCurrency(code);
                  setActiveAmount(displayValue);
                }}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor={colors.text.muted}
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: isActive ? colors.accent.start : colors.text.primary,
                  textAlign: "right",
                  minWidth: 100,
                  padding: 0,
                }}
              />
            </GlassCard>
          );
        })}

        {/* Rate reference */}
        {rates ? (
          <GlassCard style={{ marginTop: 8 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.text.accent,
                marginBottom: 8,
              }}
            >
              Cotações (1 unidade = R$)
            </Text>
            {foreignCurrencies.map((code) => (
              <View
                key={code}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                  1 {code}
                </Text>
                <Text style={{ color: colors.text.primary, fontSize: 13 }}>
                  R${" "}
                  {rates[code].toLocaleString("pt-BR", {
                    minimumFractionDigits: 4,
                  })}
                </Text>
              </View>
            ))}
          </GlassCard>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}
