import React, { useState, useMemo, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Platform,
  Keyboard,
  Pressable,
  InputAccessoryView,
  type TextInput,
} from "react-native";
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

// Accessory-view ids for the iOS keyboard toolbar (one per input, in tab order).
const ACCESSORY = {
  priceA: "cp-priceA",
  qtyA: "cp-qtyA",
  priceB: "cp-priceB",
  qtyB: "cp-qtyB",
};

function formatNumber(n: number, decimals = 2): string {
  return n.toFixed(decimals).replace(".", ",");
}

/**
 * iOS keyboard toolbar. Numeric keypads on iOS have no return key, so this
 * provides "Próximo" (advance to the next field) and "Concluído" (dismiss).
 * Android exposes the return-key action directly, so this renders nothing there.
 */
function KeyboardToolbar({ nativeID, onNext }: { nativeID: string; onNext?: () => void }) {
  if (Platform.OS !== "ios") return null;
  return (
    <InputAccessoryView nativeID={nativeID}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: 20,
          backgroundColor: colors.bg.mid,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderTopColor: colors.glass.border,
        }}
      >
        {onNext ? (
          <Pressable onPress={onNext} hitSlop={8}>
            <Text style={{ color: colors.text.accent, fontSize: 16, fontWeight: "600" }}>
              Próximo
            </Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => Keyboard.dismiss()} hitSlop={8}>
          <Text style={{ color: colors.text.accent, fontSize: 16, fontWeight: "600" }}>
            Concluído
          </Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
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
  priceRef,
  qtyRef,
  priceAccessoryID,
  qtyAccessoryID,
  onPriceSubmit,
  onQtySubmit,
  qtyReturnKeyType,
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
  priceRef: React.RefObject<TextInput | null>;
  qtyRef: React.RefObject<TextInput | null>;
  priceAccessoryID: string;
  qtyAccessoryID: string;
  onPriceSubmit: () => void;
  onQtySubmit: () => void;
  qtyReturnKeyType: "next" | "done";
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
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <NumericInput
            label="Preço"
            value={price}
            onChangeText={onPrice}
            placeholder="0,00"
            ref={priceRef}
            returnKeyType="next"
            onSubmitEditing={onPriceSubmit}
            inputAccessoryViewID={priceAccessoryID}
          />
        </View>
        <View style={{ flex: 1 }}>
          <NumericInput
            label="Quantidade"
            value={qty}
            onChangeText={onQty}
            placeholder="0"
            suffix={unit}
            ref={qtyRef}
            returnKeyType={qtyReturnKeyType}
            onSubmitEditing={onQtySubmit}
            inputAccessoryViewID={qtyAccessoryID}
          />
        </View>
      </View>
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

  // Refs drive keyboard tab order: Preço A → Qtd A → Preço B → Qtd B.
  const priceARef = useRef<TextInput>(null);
  const qtyARef = useRef<TextInput>(null);
  const priceBRef = useRef<TextInput>(null);
  const qtyBRef = useRef<TextInput>(null);

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
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
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
          priceRef={priceARef}
          qtyRef={qtyARef}
          priceAccessoryID={ACCESSORY.priceA}
          qtyAccessoryID={ACCESSORY.qtyA}
          onPriceSubmit={() => qtyARef.current?.focus()}
          onQtySubmit={() => priceBRef.current?.focus()}
          qtyReturnKeyType="next"
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
          priceRef={priceBRef}
          qtyRef={qtyBRef}
          priceAccessoryID={ACCESSORY.priceB}
          qtyAccessoryID={ACCESSORY.qtyB}
          onPriceSubmit={() => qtyBRef.current?.focus()}
          onQtySubmit={() => Keyboard.dismiss()}
          qtyReturnKeyType="done"
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

      {/* iOS keyboard toolbars (advance / dismiss); no-op on Android */}
      <KeyboardToolbar nativeID={ACCESSORY.priceA} onNext={() => qtyARef.current?.focus()} />
      <KeyboardToolbar nativeID={ACCESSORY.qtyA} onNext={() => priceBRef.current?.focus()} />
      <KeyboardToolbar nativeID={ACCESSORY.priceB} onNext={() => qtyBRef.current?.focus()} />
      <KeyboardToolbar nativeID={ACCESSORY.qtyB} />
    </LinearGradient>
  );
}
