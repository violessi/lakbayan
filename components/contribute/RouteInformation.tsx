import React, { useState } from "react";
import { Text, View, Alert, Keyboard } from "react-native";

import OutlinedTextInput from "@/components/ui/OutlinedTextInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

interface RouteInformationProps {
  coordinates: [number, number] | null;
}

export default function RouteInformation() {
  const [todaName, setTodaName] = useState("");
  const [color, setColor] = useState("");
  const [landmark, setLandmark] = useState("");

  const handleSubmit = async () => {
    Alert.alert("No pins set!", "Please select a location on the map.");
  };
  const snapPoints = [300];

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <Text className="text-xl font-bold">Route information</Text>
        <OutlinedTextInput
          label="Route name"
          value={color}
          onChangeText={setColor}
        />
        <OutlinedTextInput
          label="Landmark Information"
          value={landmark}
          onChangeText={setLandmark}
        />
        <PrimaryButton label="Add" onPress={handleSubmit} />
      </BottomSheetView>
    </BottomSheet>
  );
}
