import React from "react";
import { View, Text, Pressable } from "react-native";
import { colors } from "@/theme/colors";

interface Segment {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function SegmentedControl({
  segments,
  selectedValue,
  onSelect,
}: SegmentedControlProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.glass.bg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.glass.border,
        padding: 3,
        marginBottom: 16,
      }}
    >
      {segments.map((seg) => {
        const isActive = seg.value === selectedValue;
        return (
          <Pressable
            key={seg.value}
            onPress={() => onSelect(seg.value)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: isActive ? colors.accent.start : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: isActive ? "600" : "400",
                color: isActive ? "#fff" : colors.text.secondary,
              }}
            >
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
