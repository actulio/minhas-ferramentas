import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { cardinalPt, smoothAngle } from "./logic";

export default function BussolaScreen() {
  const [heading, setHeading] = useState(0);
  const [trueNorth, setTrueNorth] = useState(false);
  const [accuracy, setAccuracy] = useState(3);
  const headingRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      // Permission unlocks declination-corrected true north; magnetic north
      // still works without it, so we subscribe regardless of the answer.
      await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      const s = await Location.watchHeadingAsync((data) => {
        const useTrue = data.trueHeading >= 0;
        const raw = useTrue ? data.trueHeading : data.magHeading;
        const next = smoothAngle(headingRef.current, raw, 0.15);
        headingRef.current = next;
        setHeading(next);
        setTrueNorth(useTrue);
        setAccuracy(data.accuracy);
      });
      if (cancelled) {
        s.remove();
        return;
      }
      sub = s;
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  const rounded = Math.round(heading);
  const needsCalibration = accuracy < 2;

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
    >
      <View
        style={{
          width: 260,
          height: 260,
          borderRadius: 130,
          borderWidth: 2,
          borderColor: colors.glass.border,
          justifyContent: "center",
          alignItems: "center",
          transform: [{ rotate: `${-heading}deg` }],
        }}
      >
        <Text style={{ position: "absolute", top: 12, color: colors.error, fontWeight: "700", fontSize: 20 }}>
          N
        </Text>
        <Text style={{ position: "absolute", right: 16, color: colors.text.secondary, fontSize: 16 }}>L</Text>
        <Text style={{ position: "absolute", bottom: 12, color: colors.text.secondary, fontSize: 16 }}>S</Text>
        <Text style={{ position: "absolute", left: 16, color: colors.text.secondary, fontSize: 16 }}>O</Text>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 12,
            borderRightWidth: 12,
            borderBottomWidth: 90,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: colors.accent.start,
          }}
        />
      </View>

      <GlassCard style={{ marginTop: 32, alignItems: "center", minWidth: 200 }}>
        <Text style={{ fontSize: 48, fontWeight: "700", color: colors.text.primary }}>
          {rounded}°
        </Text>
        <Text style={{ fontSize: 20, color: colors.text.accent, marginTop: 4 }}>
          {cardinalPt(heading)}
        </Text>
      </GlassCard>

      <Text style={{ marginTop: 16, color: colors.text.muted, fontSize: 12, textAlign: "center" }}>
        {trueNorth ? "Norte verdadeiro" : "Norte magnético — permita a localização para o norte verdadeiro"}
      </Text>
      {needsCalibration && (
        <Text style={{ marginTop: 8, color: colors.warning, fontSize: 12, textAlign: "center" }}>
          Bússola descalibrada. Gire o celular em forma de 8 para calibrar.
        </Text>
      )}
    </LinearGradient>
  );
}
