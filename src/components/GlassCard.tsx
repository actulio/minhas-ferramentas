import React from "react";
import { View, type ViewProps } from "react-native";
import { colors } from "@/theme/colors";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
}

export function GlassCard({ children, style, ...props }: GlassCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.glass.bg,
          borderWidth: 1,
          borderColor: colors.glass.border,
          borderRadius: 16,
          padding: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
