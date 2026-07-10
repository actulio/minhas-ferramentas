import React, { useState, useMemo } from "react";
import { ScrollView, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";
import { NumericInput } from "@/components/NumericInput";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ResultDisplay } from "@/components/ResultDisplay";
import { GlassCard } from "@/components/GlassCard";
import { compareProducts, parseDecimal, type Dimension } from "./logic";

const dimensionSegments = [
  { label: "Peso", value: "peso" },
  { label: "Volume", value: "volume" },
  { label: "Unidade", value: "unidade" },
];

const unitSegments: Record<Dimension, { label: string; value: string }[]> = {
  peso: [
    { label: "g", value: "g" },
    { label: "kg", value: "kg" },
  ],
  volume: [
    { label: "ml", value: "ml" },
    { label: "L", value: "L" },
  ],
  unidade: [{ label: "un", value: "un" }],
};

const baseUnitFor: Record<Dimension, string> = {
  peso: "g",
  volume: "ml",
  unidade: "un",
};

function formatNumber(n: number, decimals = 2): string {
  return n.toFixed(decimals).replace(".", ",");
}

function ProductFields({
  title,
  dimension,
  price,
  qty,
  unit,
  onPrice,
  onQty,
  onUnit,
  highlighted,
}: {
  title: string;
  dimension: Dimension;
  price: string;
  qty: string;
  unit: string;
  onPrice: (t: string) => void;
  onQty: (t: string) => void;
  onUnit: (u: string) => void;
  highlighted: boolean;
}) {
  return (
    <GlassCard
      style={{
        marginBottom: 16,
        borderColor: highlighted ? colors.success : colors.glass.border,
        borderWidth: highlighted ? 2 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: colors.text.primary,
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      <NumericInput label="Preço" value={price} onChangeText={onPrice} placeholder="0,00" />
      <NumericInput
        label="Quantidade"
        value={qty}
        onChangeText={onQty}
        placeholder="0"
        suffix={unit}
      />
      {dimension !== "unidade" && (
        <SegmentedControl
          segments={unitSegments[dimension]}
          selectedValue={unit}
          onSelect={onUnit}
        />
      )}
    </GlassCard>
  );
}

function PriceRow({
  label,
  value,
  unit,
  best,
}: {
  label: string;
  value: number | null;
  unit: string;
  best: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: best ? colors.success : colors.text.secondary, fontWeight: "500" }}>
        {label}
      </Text>
      <Text style={{ color: best ? colors.success : colors.text.primary, fontWeight: "600" }}>
        {value === null ? "—" : `${formatNumber(value)}/${unit}`}
      </Text>
    </View>
  );
}

export default function ComparadorPrecosScreen() {
  const [dimension, setDimension] = useState<Dimension>("peso");
  const [priceA, setPriceA] = useState("");
  const [qtyA, setQtyA] = useState("");
  const [unitA, setUnitA] = useState("g");
  const [priceB, setPriceB] = useState("");
  const [qtyB, setQtyB] = useState("");
  const [unitB, setUnitB] = useState("g");

  function handleDimensionChange(val: string) {
    const dim = val as Dimension;
    setDimension(dim);
    setUnitA(baseUnitFor[dim]);
    setUnitB(baseUnitFor[dim]);
  }

  const result = useMemo(
    () =>
      compareProducts(
        { price: parseDecimal(priceA), qty: parseDecimal(qtyA), unit: unitA },
        { price: parseDecimal(priceB), qty: parseDecimal(qtyB), unit: unitB },
        dimension,
      ),
    [priceA, qtyA, unitA, priceB, qtyB, unitB, dimension],
  );

  const headline = useMemo(() => {
    if (result.winner === "A" && result.percentCheaper !== null)
      return `Produto A — ${formatNumber(result.percentCheaper, 0)}% mais barato`;
    if (result.winner === "B" && result.percentCheaper !== null)
      return `Produto B — ${formatNumber(result.percentCheaper, 0)}% mais barato`;
    if (result.winner === "empate") return "Empate — mesmo preço por unidade";
    return null;
  }, [result]);

  const hasAnyPrice = result.displayPriceA !== null || result.displayPriceB !== null;

  return (
    <LinearGradient colors={[colors.bg.start, colors.bg.mid, colors.bg.end]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: colors.text.accent,
            marginBottom: 8,
          }}
        >
          O que está comparando?
        </Text>
        <SegmentedControl
          segments={dimensionSegments}
          selectedValue={dimension}
          onSelect={handleDimensionChange}
        />

        <View style={{ height: 16 }} />

        <ProductFields
          title="Produto A"
          dimension={dimension}
          price={priceA}
          qty={qtyA}
          unit={unitA}
          onPrice={setPriceA}
          onQty={setQtyA}
          onUnit={setUnitA}
          highlighted={result.winner === "A"}
        />
        <ProductFields
          title="Produto B"
          dimension={dimension}
          price={priceB}
          qty={qtyB}
          unit={unitB}
          onPrice={setPriceB}
          onQty={setQtyB}
          onUnit={setUnitB}
          highlighted={result.winner === "B"}
        />

        {headline ? <ResultDisplay label="Melhor custo-benefício" value={headline} /> : null}

        {hasAnyPrice ? (
          <GlassCard>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.text.accent,
                marginBottom: 8,
              }}
            >
              Preço por {result.displayUnit}
            </Text>
            <PriceRow
              label="Produto A"
              value={result.displayPriceA}
              unit={result.displayUnit}
              best={result.winner === "A"}
            />
            <PriceRow
              label="Produto B"
              value={result.displayPriceB}
              unit={result.displayUnit}
              best={result.winner === "B"}
            />
          </GlassCard>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}
