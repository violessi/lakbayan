import React from "react";

import { Button } from "react-native-paper";

interface PrimaryButtonOutlineProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  testId?: string;
}

export default function PrimaryButtonOutline({
  children,
  onPress,
  disabled = false,
  className,
  testId = "secondary-button",
}: PrimaryButtonOutlineProps) {
  return (
    <Button
      mode="outlined"
      buttonColor="white"
      textColor="#7F55D9"
      style={{ borderColor: "#7F55D9" }}
      className={`px-2 py-1 w-100 ${className}`}
      onPress={onPress}
      disabled={disabled}
      testID={testId}
    >
      {children}
    </Button>
  );
}
