import React, { useState, useMemo } from "react";
import { ScrollView, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";
import { NumericInput } from "@/components/NumericInput";
import { SegmentedControl } from "@/components/SegmentedControl";
import { GlassCard } from "@/components/GlassCard";
import {
  convertMlToOz,
  convertOzToMl,
  convertFtToM,
  convertMToFt,
  convertInToCm,
  convertCmToIn,
  parseOunceInput,
  convertTime,
  cToF,
  fToC,
  type TimeUnit,
} from "./logic";

type TabType = "volume" | "ft_m" | "in_cm" | "tempo" | "temperatura";

const tabs = [
  { label: "Volume", value: "volume" },
  { label: "Pés / Metros", value: "ft_m" },
  { label: "Pol. / Centímetros", value: "in_cm" },
  { label: "Tempo", value: "tempo" },
  { label: "Temperatura", value: "temperatura" },
];

const timeUnitSegments = [
  { label: "seg", value: "s" },
  { label: "min", value: "min" },
  { label: "h", value: "h" },
  { label: "dias", value: "d" },
  { label: "anos", value: "ano" },
];

const timeUnitLabels: Record<TimeUnit, string> = {
  s: "Segundos",
  min: "Minutos",
  h: "Horas",
  d: "Dias",
  ano: "Anos",
};

const allTimeUnits: TimeUnit[] = ["s", "min", "h", "d", "ano"];

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 1e6) / 1e6;
  return String(rounded).replace(".", ",");
}

export default function ConversorUnidadesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("volume");

  // Tempo: one value + a source unit, converted to all other units
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("h");
  const [timeValue, setTimeValue] = useState("");

  // Temperatura: bidirectional C <-> F
  const [tempActiveField, setTempActiveField] = useState<"c" | "f">("c");
  const [tempValue, setTempValue] = useState("");

  // Keep separate state for each tab so switching tabs doesn't mix values
  const [volumeActiveField, setVolumeActiveField] = useState<"ml" | "oz">("ml");
  const [volumeValue, setVolumeValue] = useState("");

  const [lengthFtMActiveField, setLengthFtMActiveField] = useState<"ft" | "m">(
    "ft",
  );
  const [lengthFtMValue, setLengthFtMValue] = useState("");

  const [lengthInCmActiveField, setLengthInCmActiveField] = useState<
    "in" | "cm"
  >("in");
  const [lengthInCmValue, setLengthInCmValue] = useState("");

  // Helper to format values for display when they are recalculated
  const formatValue = (val: number): string => {
    if (val === 0) return "";
    // If integer, return as integer. Otherwise, format to max 4 decimal places
    if (Number.isInteger(val)) return val.toString();

    // Remove trailing zeros after rounding
    const rounded = parseFloat(val.toFixed(4));
    return rounded.toString().replace(".", ",");
  };

  // Convert helpers
  const volumeValues = useMemo(() => {
    const num =
      volumeActiveField === "oz"
        ? parseOunceInput(volumeValue)
        : parseFloat(volumeValue.replace(",", ".")) || 0;
    if (num === 0)
      return {
        ml: volumeActiveField === "ml" ? volumeValue : "",
        oz: volumeActiveField === "oz" ? volumeValue : "",
      };

    if (volumeActiveField === "ml") {
      return {
        ml: volumeValue,
        oz: formatValue(convertMlToOz(num)),
      };
    } else {
      return {
        ml: formatValue(convertOzToMl(num)),
        oz: volumeValue,
      };
    }
  }, [volumeValue, volumeActiveField]);

  const lengthFtMValues = useMemo(() => {
    const num = parseFloat(lengthFtMValue.replace(",", ".")) || 0;
    if (num === 0)
      return {
        ft: lengthFtMActiveField === "ft" ? lengthFtMValue : "",
        m: lengthFtMActiveField === "m" ? lengthFtMValue : "",
      };

    if (lengthFtMActiveField === "ft") {
      return {
        ft: lengthFtMValue,
        m: formatValue(convertFtToM(num)),
      };
    } else {
      return {
        ft: formatValue(convertMToFt(num)),
        m: lengthFtMValue,
      };
    }
  }, [lengthFtMValue, lengthFtMActiveField]);

  const lengthInCmValues = useMemo(() => {
    const num = parseFloat(lengthInCmValue.replace(",", ".")) || 0;
    if (num === 0)
      return {
        in: lengthInCmActiveField === "in" ? lengthInCmValue : "",
        cm: lengthInCmActiveField === "cm" ? lengthInCmValue : "",
      };

    if (lengthInCmActiveField === "in") {
      return {
        in: lengthInCmValue,
        cm: formatValue(convertInToCm(num)),
      };
    } else {
      return {
        in: formatValue(convertCmToIn(num)),
        cm: lengthInCmValue,
      };
    }
  }, [lengthInCmValue, lengthInCmActiveField]);

  const timeResults = useMemo(() => {
    const parsed = parseFloat(timeValue.replace(",", ".")) || 0;
    return allTimeUnits
      .filter((u) => u !== timeUnit)
      .map((u) => ({
        unit: u,
        label: timeUnitLabels[u],
        value: formatNumber(convertTime(parsed, timeUnit, u)),
      }));
  }, [timeValue, timeUnit]);

  const tempValues = useMemo(() => {
    const parsed = parseFloat(tempValue.replace(",", ".")) || 0;
    if (tempActiveField === "c") {
      return { c: tempValue, f: tempValue ? formatNumber(cToF(parsed)) : "" };
    }
    return { c: tempValue ? formatNumber(fToC(parsed)) : "", f: tempValue };
  }, [tempValue, tempActiveField]);

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
          Categoria:
        </Text>
        <SegmentedControl
          segments={tabs}
          selectedValue={activeTab}
          onSelect={(val) => setActiveTab(val as TabType)}
        />

        <GlassCard style={{ marginBottom: 16 }}>
          {activeTab === "volume" && (
            <View>
              <NumericInput
                label="Mililitros (ml)"
                value={volumeValues.ml}
                onChangeText={(text) => {
                  setVolumeActiveField("ml");
                  setVolumeValue(text);
                }}
                placeholder="0"
                suffix="ml"
              />
              <NumericInput
                label="Onças Fluídas (fl oz)"
                value={volumeValues.oz}
                onChangeText={(text) => {
                  setVolumeActiveField("oz");
                  setVolumeValue(text);
                }}
                placeholder="Ex: 1/2"
                suffix="fl oz"
                keyboardType="default"
              />
            </View>
          )}

          {activeTab === "ft_m" && (
            <View>
              <NumericInput
                label="Pés (ft)"
                value={lengthFtMValues.ft}
                onChangeText={(text) => {
                  setLengthFtMActiveField("ft");
                  setLengthFtMValue(text);
                }}
                placeholder="0"
                suffix="ft"
              />
              <NumericInput
                label="Metros (m)"
                value={lengthFtMValues.m}
                onChangeText={(text) => {
                  setLengthFtMActiveField("m");
                  setLengthFtMValue(text);
                }}
                placeholder="0"
                suffix="m"
              />
            </View>
          )}

          {activeTab === "in_cm" && (
            <View>
              <NumericInput
                label="Polegadas (in)"
                value={lengthInCmValues.in}
                onChangeText={(text) => {
                  setLengthInCmActiveField("in");
                  setLengthInCmValue(text);
                }}
                placeholder="0"
                suffix="in"
              />
              <NumericInput
                label="Centímetros (cm)"
                value={lengthInCmValues.cm}
                onChangeText={(text) => {
                  setLengthInCmActiveField("cm");
                  setLengthInCmValue(text);
                }}
                placeholder="0"
                suffix="cm"
              />
            </View>
          )}

          {activeTab === "tempo" && (
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: colors.text.accent,
                  marginBottom: 8,
                }}
              >
                Unidade de origem:
              </Text>
              <SegmentedControl
                segments={timeUnitSegments}
                selectedValue={timeUnit}
                onSelect={(val) => setTimeUnit(val as TimeUnit)}
              />
              <NumericInput
                label={timeUnitLabels[timeUnit]}
                value={timeValue}
                onChangeText={setTimeValue}
                placeholder="0"
                suffix={timeUnit === "ano" ? "anos" : timeUnit}
              />
              <View style={{ marginTop: 4 }}>
                {timeResults.map((r) => (
                  <View
                    key={r.unit}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{ color: colors.text.secondary, fontSize: 14 }}
                    >
                      {r.label}
                    </Text>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {r.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === "temperatura" && (
            <View>
              <NumericInput
                label="Celsius (°C)"
                value={tempValues.c}
                onChangeText={(text) => {
                  setTempActiveField("c");
                  setTempValue(text);
                }}
                placeholder="0"
                suffix="°C"
                keyboardType="numbers-and-punctuation"
              />
              <NumericInput
                label="Fahrenheit (°F)"
                value={tempValues.f}
                onChangeText={(text) => {
                  setTempActiveField("f");
                  setTempValue(text);
                }}
                placeholder="0"
                suffix="°F"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          )}
        </GlassCard>

        {/* Informative Helper Card */}
        <GlassCard>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.text.accent,
              marginBottom: 8,
            }}
          >
            Fórmulas de Referência
          </Text>
          {activeTab === "volume" && (
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                • 1 ml ≈ 0,0338 fl oz
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                • 1 fl oz ≈ 29,5735 ml
              </Text>
            </View>
          )}
          {activeTab === "ft_m" && (
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                • 1 ft = 0,3048 m
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                • 1 m ≈ 3,2808 ft
              </Text>
            </View>
          )}
          {activeTab === "in_cm" && (
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                • 1 in = 2,54 cm
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                • 1 cm ≈ 0,3937 in
              </Text>
            </View>
          )}
          {activeTab === "tempo" && (
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                • 1 min = 60 s • 1 h = 3600 s • 1 dia = 86.400 s
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                • 1 ano = 365 dias (aproximação)
              </Text>
            </View>
          )}
          {activeTab === "temperatura" && (
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                • °F = °C × 9/5 + 32
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                • °C = (°F − 32) × 5/9
              </Text>
            </View>
          )}
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}
