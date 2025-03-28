import React from "react";

import { Button } from "react-native-paper";

interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: SecondaryButtonProps) {
  return (
    <Button
      mode="outlined"
      textColor="#7F7F7F"
      style={{
        borderColor: "#7F7F7F",
        borderWidth: 0.3,
        backgroundColor: "white",
        borderRadius: 12,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
