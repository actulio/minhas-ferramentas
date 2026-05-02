import React, { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Search } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { appRegistry } from "@/registry";
import {
  categoryLabels,
  categoryOrder,
  type AppCategory,
} from "@/registry/types";
import { AppCard } from "@/components/AppCard";
import { CategoryDivider } from "@/components/CategoryDivider";

/** Strip accents/diacritics for accent-insensitive comparison */
function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return appRegistry;
    const q = normalize(search);
    return appRegistry.filter(
      (app) =>
        normalize(app.name).includes(q) ||
        normalize(app.description).includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Partial<Record<AppCategory, typeof filtered>> = {};
    for (const app of filtered) {
      if (!groups[app.category]) groups[app.category] = [];
      groups[app.category]!.push(app);
    }
    return groups;
  }, [filtered]);

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
        {/* Header */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: colors.text.primary,
          }}
        >
          Minhas Ferramentas
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.text.secondary,
            marginTop: 4,
            marginBottom: 20,
          }}
        >
          {appRegistry.length}{" "}
          {appRegistry.length === 1
            ? "ferramenta disponível"
            : "ferramentas disponíveis"}
        </Text>

        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.glass.bg,
            borderWidth: 1,
            borderColor: colors.glass.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 8,
          }}
        >
          <Search color={colors.text.muted} size={18} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar ferramentas..."
            placeholderTextColor={colors.text.muted}
            style={{
              flex: 1,
              fontSize: 15,
              color: colors.text.primary,
              marginLeft: 10,
              padding: 0,
            }}
          />
        </View>

        {/* App list grouped by category */}
        {categoryOrder.map((cat) => {
          const apps = grouped[cat];
          if (!apps || apps.length === 0) return null;
          return (
            <View key={cat}>
              <CategoryDivider label={categoryLabels[cat]} />
              {apps.map((app) => (
                <AppCard
                  key={app.id}
                  id={app.id}
                  name={app.name}
                  description={app.description}
                  icon={app.icon}
                  onPress={() => router.push(`/app/${app.id}`)}
                />
              ))}
            </View>
          );
        })}

        {filtered.length === 0 ? (
          <Text
            style={{
              color: colors.text.secondary,
              textAlign: "center",
              marginTop: 40,
            }}
          >
            Nenhuma ferramenta encontrada.
          </Text>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}
