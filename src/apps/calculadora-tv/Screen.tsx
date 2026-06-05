import React, { useState, useMemo } from "react";
import { ScrollView, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";
import { NumericInput } from "@/components/NumericInput";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ResultDisplay } from "@/components/ResultDisplay";
import { GlassCard } from "@/components/GlassCard";
import { calculateDistanceRange, calculateSizeRange } from "./logic";

type TVCalcMode = "size_to_dist" | "dist_to_size";

const modes = [
  { label: "Por Tamanho da TV", value: "size_to_dist" },
  { label: "Por Distância", value: "dist_to_size" },
];

export default function CalculadoraTvScreen() {
  const [mode, setMode] = useState<TVCalcMode>("size_to_dist");
  const [tvSize, setTvSize] = useState("");
  const [distance, setDistance] = useState("");

  const result = useMemo(() => {
    if (mode === "size_to_dist") {
      const sizeNum = parseFloat(tvSize.replace(",", ".")) || 0;
      if (sizeNum <= 0) return null;
      const { minDistance, maxDistance, idealDistance } =
        calculateDistanceRange(sizeNum);

      const formatDist = (val: number) =>
        val.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

      return {
        label: "Distância Recomendada",
        value: formatDist(idealDistance),
        unit: "metros",
        range: `${formatDist(minDistance)} - ${formatDist(maxDistance)} metros`,
      };
    } else {
      const distNum = parseFloat(distance.replace(",", ".")) || 0;
      if (distNum <= 0) return null;
      const { minSize, maxSize, idealSize } = calculateSizeRange(distNum);

      // Round sizes to nearest whole integer for television size standards (e.g. 50" to 65")
      const minS = Math.round(minSize);
      const maxS = Math.round(maxSize);
      const idealS = Math.round(idealSize);

      return {
        label: "Tamanho Recomendado",
        value: `${idealS}"`,
        unit: "polegadas",
        range: `${minS}" - ${maxS}"`,
      };
    }
  }, [mode, tvSize, distance]);

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
          Calcular por:
        </Text>
        <SegmentedControl
          segments={modes}
          selectedValue={mode}
          onSelect={(val) => setMode(val as TVCalcMode)}
        />

        {result ? (
          <>
            <ResultDisplay
              label={result.label}
              value={result.value}
              unit={result.unit}
            />
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: 13,
                lineHeight: 18,
                marginTop: -8,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Faixa recomendada: {result.range}
            </Text>
          </>
        ) : null}

        <GlassCard style={{ marginBottom: 16 }}>
          {mode === "size_to_dist" ? (
            <NumericInput
              label="Tamanho da TV (Polegadas)"
              value={tvSize}
              onChangeText={setTvSize}
              placeholder="Ex: 55"
              suffix="polegadas"
            />
          ) : (
            <NumericInput
              label="Distância de Visualização (Metros)"
              value={distance}
              onChangeText={setDistance}
              placeholder="Ex: 2,0"
              suffix="metros"
            />
          )}
        </GlassCard>

        {/* Explain standards */}
        <GlassCard>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.text.accent,
              marginBottom: 8,
            }}
          >
            Como é calculado?
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 13,
              lineHeight: 18,
              marginBottom: 10,
            }}
          >
            Os limites calculados baseiam-se em padrões da indústria de cinema e
            transmissão de TV:
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 13,
              lineHeight: 18,
              marginBottom: 4,
            }}
          >
            •{" "}
            <Text style={{ color: colors.text.primary, fontWeight: "500" }}>
              Distância Mínima / Tamanho Máximo (Padrão THX):
            </Text>{" "}
            Recomendado para uma experiência de cinema imersiva (ângulo de visão
            de 40°).
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            •{" "}
            <Text style={{ color: colors.text.primary, fontWeight: "500" }}>
              Distância Máxima / Tamanho Mínimo (Padrão SMPTE):
            </Text>{" "}
            Recomendado para uso misto no dia a dia, como novelas e telejornais
            (ângulo de visão de 30°).
          </Text>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}
