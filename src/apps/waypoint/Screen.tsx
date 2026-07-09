import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin } from "lucide-react-native";
import * as Location from "expo-location";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import { loadJSON, saveJSON } from "@/store/storage";
import {
  haversineDistance,
  bearing,
  arrowRotation,
  formatDistance,
  smoothAngle,
  type Coord,
} from "./logic";
import { SavedWaypoints, type Waypoint } from "./SavedWaypoints";

const STORAGE_KEY = "waypoint-saved-points";

export default function WaypointScreen() {
  const [permission, setPermission] = useState<"unknown" | "granted" | "denied">("unknown");
  const [current, setCurrent] = useState<Coord | null>(null);
  const [heading, setHeading] = useState(0);
  const [items, setItems] = useState<Waypoint[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const headingRef = useRef(0);

  // Load saved waypoints on mount
  useEffect(() => {
    loadJSON<Waypoint[]>(STORAGE_KEY).then((saved) => {
      if (saved) setItems(saved);
    });
  }, []);

  // Request permission + start watching position and heading
  useEffect(() => {
    let cancelled = false;
    let headSub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== "granted") {
        setPermission("denied");
        return;
      }
      setPermission("granted");
      const posSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (loc) => setCurrent({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }),
      );
      if (cancelled) {
        posSub.remove();
        return;
      }
      watchRef.current = posSub;
      // OS-fused heading (true north when available) keeps the arrow aligned
      // with real-world bearings; smoothing damps the jitter.
      const hSub = await Location.watchHeadingAsync((data) => {
        const raw = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
        const next = smoothAngle(headingRef.current, raw, 0.15);
        headingRef.current = next;
        setHeading(next);
      });
      if (cancelled) {
        hSub.remove();
        return;
      }
      headSub = hSub;
    })();
    return () => {
      cancelled = true;
      watchRef.current?.remove();
      headSub?.remove();
    };
  }, []);

  const persist = useCallback(async (next: Waypoint[]) => {
    setItems(next);
    await saveJSON(STORAGE_KEY, next);
  }, []);

  const handleMark = useCallback(async () => {
    if (!current) {
      Alert.alert("Sem localização", "Aguardando sinal de GPS. Tente novamente em instantes.");
      return;
    }
    const wpName = name.trim() || `Local ${items.length + 1}`;
    const wp: Waypoint = {
      id: String(Date.now()),
      name: wpName,
      coord: current,
      createdAt: new Date().toISOString(),
    };
    await persist([wp, ...items]);
    setActiveId(wp.id);
    setName("");
  }, [current, name, items, persist]);

  const handleDelete = useCallback(
    (id: string) => {
      void persist(items.filter((i) => i.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [items, activeId, persist],
  );

  const active = items.find((i) => i.id === activeId) ?? null;
  const distance = active && current ? haversineDistance(current, active.coord) : null;
  const targetBearing = active && current ? bearing(current, active.coord) : 0;
  const rotation = arrowRotation(targetBearing, heading);

  if (permission === "denied") {
    return (
      <LinearGradient
        colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}
      >
        <Text style={{ color: colors.text.primary, fontSize: 16, textAlign: "center", marginBottom: 16 }}>
          Permissão de localização negada. Habilite o acesso à localização nas configurações do sistema para usar o waypoint.
        </Text>
        <Pressable
          onPress={async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setPermission(status === "granted" ? "granted" : "denied");
          }}
          style={{ backgroundColor: colors.accent.start, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Tentar novamente</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.bg.start, colors.bg.mid, colors.bg.end]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {active && (
          <GlassCard style={{ alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 26,
                borderRightWidth: 26,
                borderBottomWidth: 120,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderBottomColor: colors.accent.start,
                transform: [{ rotate: `${rotation}deg` }],
                marginVertical: 20,
              }}
            />
            <Text style={{ fontSize: 40, fontWeight: "700", color: colors.text.primary }}>
              {distance !== null ? formatDistance(distance) : "—"}
            </Text>
            <Text style={{ fontSize: 16, color: colors.text.accent, marginTop: 4 }}>
              até {active.name}
            </Text>
          </GlassCard>
        )}

        <GlassCard style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text.accent, marginBottom: 8 }}>
            Nome do local (opcional)
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Carro, Barraca, Trilha"
            placeholderTextColor={colors.text.muted}
            style={{
              backgroundColor: colors.glass.bg,
              borderWidth: 1,
              borderColor: colors.glass.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.text.primary,
              fontSize: 16,
              marginBottom: 12,
            }}
          />
          <Pressable
            onPress={handleMark}
            style={{
              backgroundColor: colors.accent.start,
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MapPin color="#fff" size={18} style={{ marginRight: 8 }} />
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
              Marcar local aqui
            </Text>
          </Pressable>
          {current && (
            <Text style={{ color: colors.text.muted, fontSize: 12, marginTop: 8, textAlign: "center" }}>
              Posição atual: {current.latitude.toFixed(5)}, {current.longitude.toFixed(5)}
            </Text>
          )}
        </GlassCard>

        <SavedWaypoints
          items={items}
          activeId={activeId}
          onSelect={(wp) => setActiveId(wp.id)}
          onDelete={handleDelete}
        />
      </ScrollView>
    </LinearGradient>
  );
}
