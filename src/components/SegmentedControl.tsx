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
  /**
   * When true, segments flow into a 3-column grid that wraps onto multiple
   * rows instead of being squeezed into a single row. Use for 4+ segments
   * with longer labels; leave off for short single-row selectors.
   */
  wrap?: boolean;
}

export function SegmentedControl({
  segments,
  selectedValue,
  onSelect,
  wrap = false,
}: SegmentedControlProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: wrap ? "wrap" : "nowrap",
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
              width: wrap ? "33.333%" : undefined,
              flex: wrap ? undefined : 1,
              padding: wrap ? 3 : 0,
            }}
          >
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 6,
                borderRadius: 12,
                minHeight: wrap ? 46 : undefined,
                backgroundColor: isActive ? colors.accent.start : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? "600" : "400",
                  color: isActive ? "#fff" : colors.text.secondary,
                  textAlign: "center",
                }}
              >
                {seg.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
