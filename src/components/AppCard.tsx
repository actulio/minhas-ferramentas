import React from "react";
import { Pressable, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { icons } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { useFavoritesStore } from "@/store/favorites";
import { GlassCard } from "./GlassCard";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AppCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  onPress: () => void;
}

export function AppCard({
  id,
  name,
  description,
  icon,
  onPress,
}: AppCardProps) {
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(id));
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const LucideIcon = (
    icons as Record<
      string,
      React.ComponentType<{ color: string; size: number }>
    >
  )[icon];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={animatedStyle}
    >
      <GlassCard
        style={{ marginBottom: 12, flexDirection: "row", alignItems: "center" }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: "rgba(59,130,246,0.15)",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 14,
          }}
        >
          {LucideIcon ? (
            <LucideIcon color={colors.accent.start} size={22} />
          ) : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text.primary,
            }}
          >
            {name}
          </Text>
          <Text
            style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}
          >
            {description}
          </Text>
        </View>
        <Pressable
          onPress={() => toggleFavorite(id)}
          hitSlop={12}
          style={{ padding: 8 }}
        >
          <Text
            style={{
              fontSize: 20,
              color: isFavorite ? colors.accent.start : colors.text.muted,
            }}
          >
            {isFavorite ? "♥" : "♡"}
          </Text>
        </Pressable>
      </GlassCard>
    </AnimatedPressable>
  );
}
