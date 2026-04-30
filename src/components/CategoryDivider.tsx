import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/theme/colors';

interface CategoryDividerProps {
  label: string;
}

export function CategoryDivider({ label }: CategoryDividerProps) {
  return (
    <View style={{ marginTop: 24, marginBottom: 12, paddingHorizontal: 4 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: colors.text.accent,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: colors.glass.border,
          marginTop: 8,
        }}
      />
    </View>
  );
}
