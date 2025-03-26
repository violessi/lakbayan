import React from "react";

import { Button } from "react-native-paper";

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Button
      mode="contained"
      buttonColor="#7F55D9"
      textColor="white"
      className="px-2 py-1 w-100"
      onPress={onPress}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
