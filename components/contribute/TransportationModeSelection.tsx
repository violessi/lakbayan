import React, { useState } from "react";
import { Text, View } from "react-native";
import { RadioButton } from "react-native-paper";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { TRANSPORTATION_MODES } from "@/constants/transportation-modes";
import { TransportationMode } from "@/types/route-types";

interface TransportationModeSelectionProps {
  onTransportationModeChange: (mode: string) => void;
}

export default function TransportationModeSelection({ onTransportationModeChange }: TransportationModeSelectionProps) {
  const snapPoints = ["30%", "90%"];
  const [selectedMode, setSelectedMode] = useState<string>("");

  const handleModeChange = (mode: TransportationMode) => {
    setSelectedMode(mode);
    onTransportationModeChange(mode);
  };

  return (
    <BottomSheet snapPoints={snapPoints} index={1}>
      <BottomSheetView className="flex flex-col px-5 gap-8">
        <View className="flex flex-col mt-4">
          <Text className="text-lg font-bold">Transportation Modes</Text>
          {TRANSPORTATION_MODES.map((mode) => (
            <View key={mode} className="flex flex-row items-center">
              <RadioButton
                value={mode}
                status={selectedMode === mode ? "checked" : "unchecked"}
                onPress={() => handleModeChange(mode)}
              />
              <Text>{mode}</Text>
            </View>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
