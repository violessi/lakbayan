import React, { useState } from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { TRANSPORTATION_MODES } from "@constants/transportation-modes";

interface TransportationModeSelectionProps {
  onTransportationModeChange: (mode: TransportationMode) => void;
}

export default function TransportationModeSelection({ onTransportationModeChange }: TransportationModeSelectionProps) {
  const [selectedMode, setSelectedMode] = useState<string>("");

  const handleModeChange = (mode: TransportationMode) => {
    setSelectedMode(mode);
    onTransportationModeChange(mode);
  };

  return (
    <View className="flex flex-col px-5 gap-3">
      <View className="flex flex-row gap-2 justify-center">
        {TRANSPORTATION_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.label}
            className={`flex flex-col items-center w-16 px-2 py-2 border rounded-md ${
              selectedMode === mode.label ? " border-primary" : "border-gray-300"
            }`}
            onPress={() => handleModeChange(mode.label)}
          >
            <Image
              source={mode.icon}
              style={{
                width: 20,
                height: 30,
                resizeMode: "contain",
                tintColor: selectedMode === mode.label ? "#7F55D9" : "#7F7F7F",
              }}
            />
            <Text className={`mt-1 text-xs ${selectedMode === mode.label ? "text-primary" : "text-secondary"}`}>
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
