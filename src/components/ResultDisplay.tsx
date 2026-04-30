import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';

interface ResultDisplayProps {
  label: string;
  value: string;
  unit?: string;
}

export function ResultDisplay({ label, value, unit }: ResultDisplayProps) {
  return (
    <LinearGradient
      colors={[colors.accent.start, colors.accent.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}
    >
      <Text style={{ fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
        <Text style={{ fontSize: 32, fontWeight: '700', color: '#fff' }}>
          {value}
        </Text>
        {unit ? (
          <Text style={{ fontSize: 16, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginLeft: 6 }}>
            {unit}
          </Text>
        ) : null}
      </View>
    </LinearGradient>
  );
}
