import React from "react";
import {
  View,
  Text,
  TextInput,
  type TextInput as TextInputType,
  type TextInputProps,
} from "react-native";
import { colors } from "@/theme/colors";

interface NumericInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suffix?: string;
  error?: string;
  keyboardType?: TextInputProps["keyboardType"];
  returnKeyType?: "next" | "done" | "go" | "search" | "send";
  onSubmitEditing?: () => void;
  inputAccessoryViewID?: string;
}

export const NumericInput = React.forwardRef<TextInputType, NumericInputProps>(
  function NumericInput(
    {
      label,
      value,
      onChangeText,
      placeholder,
      suffix,
      error,
      keyboardType = "decimal-pad",
      returnKeyType,
      onSubmitEditing,
      inputAccessoryViewID,
    },
    ref,
  ) {
    return (
      <View style={{ marginBottom: 14 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: colors.text.accent,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.glass.bg,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.glass.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.text.muted}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={!onSubmitEditing}
            inputAccessoryViewID={inputAccessoryViewID}
            style={{
              flex: 1,
              fontSize: 16,
              color: colors.text.primary,
              padding: 0,
            }}
          />
          {suffix ? (
            <Text
              style={{
                fontSize: 14,
                color: colors.text.secondary,
                marginLeft: 8,
              }}
            >
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
  },
);
