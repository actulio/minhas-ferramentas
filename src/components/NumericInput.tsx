import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { colors } from '@/theme/colors';

interface NumericInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suffix?: string;
  error?: string;
}

export function NumericInput({
  label,
  value,
  onChangeText,
  placeholder,
  suffix,
  error,
}: NumericInputProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.accent, marginBottom: 6 }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.glass.bg,
          borderWidth: 1,
          borderColor: error ? colors.error : colors.glass.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          keyboardType="numeric"
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text.primary,
            padding: 0,
          }}
        />
        {suffix ? (
          <Text style={{ fontSize: 14, color: colors.text.secondary, marginLeft: 8 }}>
            {suffix}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text style={{ fontSize: 12, color: colors.error, marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
