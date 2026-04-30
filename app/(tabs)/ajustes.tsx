import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { appRegistry } from '@/registry';
import { GlassCard } from '@/components/GlassCard';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const router = useRouter();
  const appsWithSettings = appRegistry.filter((app) => app.settings && app.settings.length > 0);

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32 }}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text.primary, marginBottom: 24 }}>
          Ajustes
        </Text>

        {/* Per-app settings */}
        {appsWithSettings.length > 0 ? (
          <>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.accent, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>
              Por Ferramenta
            </Text>
            {appsWithSettings.map((app) => (
              <Pressable key={app.id} onPress={() => router.push(`/settings/${app.id}`)}>
                <GlassCard style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ flex: 1, fontSize: 15, color: colors.text.primary }}>{app.name}</Text>
                  <ChevronRight color={colors.text.muted} size={18} />
                </GlassCard>
              </Pressable>
            ))}
          </>
        ) : null}

        {/* About */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.accent, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 32, marginBottom: 12 }}>
          Sobre
        </Text>
        <GlassCard>
          <Text style={{ fontSize: 15, color: colors.text.primary, fontWeight: '600' }}>Minhas Ferramentas</Text>
          <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 4 }}>
            Versão {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}
