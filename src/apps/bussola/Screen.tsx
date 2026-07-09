import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Magnetometer } from "expo-sensors";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { headingFromMagnetometer, cardinalPt } from "./logic";

export default function BussolaScreen() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      setHeading(headingFromMagnetometer(x, y));
    });
    return () => sub.remove();
  }, []);

  const rounded = Math.round(heading);

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
        Heading magnético. Longe de metais/ímãs para maior precisão.
      </Text>
    </LinearGradient>
  );
}
