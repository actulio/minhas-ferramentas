import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";
import { appRegistry } from "@/registry";
import { useFavoritesStore } from "@/store/favorites";
import { AppCard } from "@/components/AppCard";

export default function FavoritesScreen() {
  const router = useRouter();
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);

  const favoriteApps = useMemo(
    () => appRegistry.filter((app) => favoriteIds.includes(app.id)),
    [favoriteIds],
  );

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 32,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: colors.text.primary,
            marginBottom: 20,
          }}
        >
          Favoritos
        </Text>

        {favoriteApps.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>♡</Text>
            <Text
              style={{
                color: colors.text.secondary,
                textAlign: "center",
                fontSize: 15,
              }}
            >
              Toque no ♡ em qualquer ferramenta{"\n"}para fixá-la aqui
            </Text>
          </View>
        ) : (
          favoriteApps.map((app) => (
            <AppCard
              key={app.id}
              id={app.id}
              name={app.name}
              description={app.description}
              icon={app.icon}
              onPress={() => router.push(`/app/${app.id}`)}
            />
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}
