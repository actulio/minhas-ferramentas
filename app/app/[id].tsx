import React from "react";
import { Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";
import { appRegistry } from "@/registry";

export default function MiniAppScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = appRegistry.find((a) => a.id === id);

  if (!app) {
    return (
      <LinearGradient
        colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: colors.text.secondary, fontSize: 16 }}>
          Ferramenta não encontrada
        </Text>
      </LinearGradient>
    );
  }

  const AppComponent = app.component;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: app.name,
          headerStyle: { backgroundColor: colors.bg.start },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <AppComponent />
    </>
  );
}
