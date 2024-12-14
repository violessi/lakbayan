import React, { useState } from "react";
import { Text, Alert, Keyboard } from "react-native";

import OutlinedTextInput from "@/components/ui/OutlinedTextInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { MapboxDirectionsResponse } from "@/types/location-types";

interface RouteInformationProps {
  directions: MapboxDirectionsResponse | null;
}

export default function RouteInformation({ directions }: RouteInformationProps) {
  const [routeName, setRouteName] = useState("");
  const [landmark, setLandmark] = useState("");

  const handleSubmit = async () => {
    if (!routeName || !landmark) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }
    Keyboard.dismiss();
  };

  const snapPoints = [300];

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <Text className="text-xl font-bold">Route Information</Text>
        <OutlinedTextInput label="Route Name" value={routeName} onChangeText={setRouteName} />
        <OutlinedTextInput label="Landmark Information" value={landmark} onChangeText={setLandmark} />
        <PrimaryButton label="Add" onPress={handleSubmit} />
      </BottomSheetView>
    </BottomSheet>
  );
}
