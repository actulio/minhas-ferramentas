import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Trash2, Navigation } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { type Coord } from "./logic";

export interface Waypoint {
  id: string;
  name: string;
  coord: Coord;
  createdAt: string;
}

interface SavedWaypointsProps {
  items: Waypoint[];
  activeId: string | null;
  onSelect: (item: Waypoint) => void;
  onDelete: (id: string) => void;
}

export function SavedWaypoints({
  items,
  activeId,
  onSelect,
  onDelete,
}: SavedWaypointsProps) {
  if (items.length === 0) return null;

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Excluir waypoint", `Deseja excluir "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => onDelete(id) },
    ]);
  };

  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.text.accent,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginBottom: 12,
        }}
      >
        Locais Salvos
      </Text>
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <Pressable key={item.id} onPress={() => onSelect(item)}>
            <GlassCard
              style={{
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                borderColor: isActive ? colors.accent.start : colors.glass.border,
              }}
            >
              <Navigation
                color={isActive ? colors.accent.start : colors.text.muted}
                size={18}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text.primary }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
                  {item.coord.latitude.toFixed(5)}, {item.coord.longitude.toFixed(5)}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDelete(item.id, item.name)}
                hitSlop={12}
                style={{ padding: 8 }}
              >
                <Trash2 color={colors.error} size={18} />
              </Pressable>
            </GlassCard>
          </Pressable>
        );
      })}
    </View>
  );
}
