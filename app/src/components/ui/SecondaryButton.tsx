import React from "react";

import { Button } from "react-native-paper";

interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
}

export default function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Button mode="contained" buttonColor="white" textColor="#999999" className="px-2 py-1" onPress={onPress}>
      {label}
    </Button>
  );
}
