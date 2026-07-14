import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { colors } from "@/theme/colors";
import { GlassCard } from "@/components/GlassCard";
import {
  MIN_DB,
  START_ANGLE,
  SWEEP_DEGREES,
  REFERENCE_POINTS,
  dbfsToSplEstimate,
  splToArcProgress,
  splToZone,
  polarToCartesian,
  describeArc,
  smooth,
  type NoiseZone,
} from "./logic";

const RADIUS = 130;
const STROKE_WIDTH = 16;
const SIZE = RADIUS * 2 + STROKE_WIDTH * 2;
const CENTER = SIZE / 2;
const POLL_INTERVAL_MS = 120;

const zoneColor: Record<NoiseZone, string> = {
  calmo: colors.success,
  moderado: colors.warning,
  alto: colors.error,
};

const recordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export default function DecibelimetroScreen() {
  const [permission, setPermission] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");
  const [db, setDb] = useState(MIN_DB);
  const smoothedRef = useRef(MIN_DB);
  const recorder = useAudioRecorder(recordingOptions);
  const recorderState = useAudioRecorderState(recorder, POLL_INTERVAL_MS);

  // Request mic permission and start metering-enabled recording on mount.
  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (cancelled) return;
      if (!status.granted) {
        setPermission("denied");
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      if (cancelled) return;
      setPermission("granted");
      await recorder.prepareToRecordAsync();
      if (cancelled) {
        recorder.stop().catch(() => {});
        return;
      }
      recorder.record();
    })();
    return () => {
      cancelled = true;
      recorder.stop().catch(() => {});
    };
  }, []);

  // Convert each metering poll into a smoothed SPL estimate.
  useEffect(() => {
    if (recorderState.metering === undefined) return;
    const estimate = dbfsToSplEstimate(recorderState.metering);
    const next = smooth(smoothedRef.current, estimate, 0.3);
    smoothedRef.current = next;
    setDb(next);
  }, [recorderState.metering]);

  if (Platform.OS === "web") {
    return (
      <LinearGradient
        colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text
          style={{
            color: colors.text.primary,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          O decibelímetro não é suportado no navegador. Abra o app no celular
          para medir o ruído ambiente.
        </Text>
      </LinearGradient>
    );
  }

  if (permission === "denied") {
    return (
      <LinearGradient
        colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text
          style={{
            color: colors.text.primary,
            fontSize: 16,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Permissão de microfone negada. Habilite o acesso ao microfone nas
          configurações do sistema para usar o decibelímetro.
        </Text>
        <Pressable
          onPress={async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            setPermission(status.granted ? "granted" : "denied");
          }}
          style={{
            backgroundColor: colors.accent.start,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Tentar novamente
          </Text>
        </Pressable>
      </LinearGradient>
    );
  }

  const progress = splToArcProgress(db);
  const zone = splToZone(db);
  const endAngle = START_ANGLE + SWEEP_DEGREES * progress;
  const trackPath = describeArc(
    CENTER,
    CENTER,
    RADIUS,
    START_ANGLE,
    START_ANGLE + SWEEP_DEGREES,
  );
  const progressPath = describeArc(
    CENTER,
    CENTER,
    RADIUS,
    START_ANGLE,
    endAngle,
  );

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          width: SIZE,
          height: SIZE,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Svg width={SIZE} height={SIZE} style={{ position: "absolute" }}>
          <Path
            d={trackPath}
            stroke={colors.glass.border}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={progressPath}
            stroke={zoneColor[zone]}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>

        {REFERENCE_POINTS.map((ref) => {
          const angle = START_ANGLE + SWEEP_DEGREES * splToArcProgress(ref.db);
          const point = polarToCartesian(
            CENTER,
            CENTER,
            RADIUS + STROKE_WIDTH,
            angle,
          );
          return (
            <Text
              key={ref.db}
              style={{
                position: "absolute",
                left: point.x - 24,
                top: point.y - 8,
                width: 48,
                fontSize: 10,
                color: colors.text.muted,
                textAlign: "center",
              }}
            >
              {ref.label}
            </Text>
          );
        })}

        <Text
          style={{
            fontSize: 48,
            fontWeight: "700",
            color: colors.text.primary,
          }}
        >
          {Math.round(db)}
        </Text>
        <Text
          style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}
        >
          dB (estimado)
        </Text>
      </View>

      <GlassCard style={{ marginTop: 24, maxWidth: 280 }}>
        <Text
          style={{
            fontSize: 12,
            color: colors.text.muted,
            textAlign: "center",
          }}
        >
          Estimativa baseada no microfone do celular. Não substitui um medidor
          de SPL calibrado.
        </Text>
      </GlassCard>
    </LinearGradient>
  );
}
