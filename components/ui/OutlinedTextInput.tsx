import React from "react";

import { TextInput } from "react-native-paper";

interface OutlinedTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function OutlinedTextInput({
  label,
  value,
  onChangeText,
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
    />
  );
}
