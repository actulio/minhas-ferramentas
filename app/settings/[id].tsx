import React from 'react';
import { Text, ScrollView, TextInput, Switch, Pressable } from 'react-native';
import { View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';
import { appRegistry } from '@/registry';
import { useSettingsStore } from '@/store/settings';
import { GlassCard } from '@/components/GlassCard';
import { type SettingsField } from '@/registry/types';

function SettingRow({ appId, field }: { appId: string; field: SettingsField }) {
  const value = useSettingsStore((s) => s.getSetting(appId, field.key));
  const setSetting = useSettingsStore((s) => s.setSetting);

  if (field.type === 'toggle') {
    return (
      <GlassCard style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, fontSize: 15, color: colors.text.primary }}>{field.label}</Text>
        <Switch
          value={Boolean(value)}
          onValueChange={(v) => setSetting(appId, field.key, v)}
          trackColor={{ false: colors.text.muted, true: colors.accent.start }}
        />
      </GlassCard>
    );
  }

  if (field.type === 'select' && field.options) {
    return (
      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.accent, marginBottom: 8 }}>{field.label}</Text>
        {field.options.map((opt) => (
          <Pressable key={String(opt.value)} onPress={() => setSetting(appId, field.key, opt.value)}>
            <GlassCard
              style={{
                marginBottom: 6,
                flexDirection: 'row',
                alignItems: 'center',
                borderColor: value === opt.value ? colors.accent.start : colors.glass.border,
              }}
            >
              <Text style={{ flex: 1, fontSize: 15, color: colors.text.primary }}>{opt.label}</Text>
              {value === opt.value ? <Text style={{ color: colors.accent.start, fontSize: 16 }}>✓</Text> : null}
            </GlassCard>
          </Pressable>
        ))}
      </View>
    );
  }

  // number type
  return (
    <GlassCard style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.accent, marginBottom: 8 }}>{field.label}</Text>
      <TextInput
        value={String(value)}
        onChangeText={(text) => {
          const num = parseFloat(text);
          if (!isNaN(num)) setSetting(appId, field.key, num);
        }}
        keyboardType="numeric"
        style={{ fontSize: 16, color: colors.text.primary, padding: 0 }}
        placeholderTextColor={colors.text.muted}
      />
    </GlassCard>
  );
}

export default function AppSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = appRegistry.find((a) => a.id === id);

  if (!app || !app.settings) {
    return (
      <LinearGradient colors={[colors.bg.start, colors.bg.mid, colors.bg.end]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text.secondary }}>Sem configurações disponíveis</Text>
      </LinearGradient>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: `${app.name} — Ajustes`,
          headerStyle: { backgroundColor: colors.bg.start },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <LinearGradient colors={[colors.bg.start, colors.bg.mid, colors.bg.end]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 }}>
          {app.settings.map((field) => (
            <SettingRow key={field.key} appId={app.id} field={field} />
          ))}
        </ScrollView>
      </LinearGradient>
    </>
  );
}
