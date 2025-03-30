import React from "react";

import { TextInput } from "react-native-paper";

interface OutlinedTextInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  secureTextEntry?: boolean;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}

export default function OutlinedTextInput({
  label,
  value,
  onChangeText,
  autoCapitalize = "none",
  keyboardType = "default",
  secureTextEntry = false,
  placeholder,
  disabled = false,
  testID,
}: OutlinedTextInputProps) {
  return (
    <TextInput
      mode="outlined"
      label={label}
      value={value}
      onChangeText={onChangeText}
      outlineColor="#7F7F7F"
      outlineStyle={{ borderWidth: 0.3 }}
      style={{ backgroundColor: "white", fontSize: 12 }}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      disabled={disabled}
      testID={testID}
    />
  );
}
