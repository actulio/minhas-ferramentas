import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Accelerometer } from "expo-sensors";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { anglesFromAccelerometer, isLevel } from "./logic";

const RADIUS = 120; // outer circle radius
const BUBBLE = 40;

export default function NivelScreen() {
  const [angles, setAngles] = useState({ pitch: 0, roll: 0 });

  useEffect(() => {
    Accelerometer.setUpdateInterval(60);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      setAngles(anglesFromAccelerometer(x, y, z));
    });
    return () => sub.remove();
  }, []);

  const level = isLevel(angles.pitch, angles.roll, 1);
  const maxOffset = RADIUS - BUBBLE / 2;
  const clamp = (v: number) => Math.max(-maxOffset, Math.min(maxOffset, v));
  // Map degrees to pixels: ~4px per degree, capped at the circle edge.
  const dx = clamp(angles.roll * 4);
  const dy = clamp(angles.pitch * 4);

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
    >
      <View
        style={{
          width: RADIUS * 2,
          height: RADIUS * 2,
          borderRadius: RADIUS,
          borderWidth: 2,
          borderColor: level ? colors.success : colors.glass.border,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ position: "absolute", width: RADIUS * 2, height: 1, backgroundColor: colors.glass.border }} />
        <View style={{ position: "absolute", width: 1, height: RADIUS * 2, backgroundColor: colors.glass.border }} />
        <View
          style={{
            width: BUBBLE,
            height: BUBBLE,
            borderRadius: BUBBLE / 2,
            backgroundColor: level ? colors.success : colors.accent.start,
            transform: [{ translateX: dx }, { translateY: dy }],
          }}
        />
      </View>

      <GlassCard style={{ marginTop: 32, alignItems: "center", minWidth: 220 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: level ? colors.success : colors.text.primary }}>
          {level ? "Nivelado" : "Ajuste a superfície"}
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 6 }}>
          Inclinação: {angles.pitch.toFixed(1)}° / {angles.roll.toFixed(1)}°
        </Text>
      </GlassCard>
    </LinearGradient>
  );
}
