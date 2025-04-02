import React from "react";

import { Button } from "react-native-paper";

interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  testId?: string;
}

export default function SecondaryButton({
  label,
  onPress,
  disabled = false,
  testId = "secondary-button",
}: SecondaryButtonProps) {
  return (
    <Button
      mode="outlined"
      buttonColor="white"
      textColor="#888888"
      style={{ borderColor: "#cccccc" }}
      className="px-2 py-1 w-100"
      onPress={onPress}
      disabled={disabled}
      testID={testId}
    >
      {label}
    </Button>
  );
}
