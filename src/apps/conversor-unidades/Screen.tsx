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
} from "./logic";

type TabType = "volume" | "ft_m" | "in_cm";

const tabs = [
  { label: "Volume", value: "volume" },
  { label: "Pés / Metros", value: "ft_m" },
  { label: "Pol. / Centímetros", value: "in_cm" },
];

export default function ConversorUnidadesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("volume");

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
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}
