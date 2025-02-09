import React, { useState } from "react";
import { Text, View, Alert, Keyboard } from "react-native";

import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { insertStop } from "@services/toda-stop-service";

import { useSession } from "@contexts/SessionContext";

interface TodaStopsProps {
  coordinates: [number, number] | null;
}

export default function TodaStops({ coordinates }: TodaStopsProps) {
  const { userId } = useSession();
  const [todaName, setTodaName] = useState("");
  const [color, setColor] = useState("");
  const [landmark, setLandmark] = useState("");

  const handleSubmit = async () => {
    if (!coordinates) {
      Alert.alert("No pins set!", "Please select a location on the map.");
      return;
    }

    if (!todaName.trim()) {
      Alert.alert("No TODA name!", "Please enter the name of the TODA.");
      return;
    }

    try {
      await insertStop({
        id: "",
        name: todaName,
        color: color,
        landmark: landmark,
        latitude: coordinates[1],
        longitude: coordinates[0],
        transpo_mode: "tricycle",
        contributor_id: userId || ""
      });

      Alert.alert("Success!", "TODA stop information submitted successfully!");
      setTodaName("");
      setColor("");
      setLandmark("");
      Keyboard.dismiss();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const snapPoints = [300];

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <Text className="text-xl font-bold">More information</Text>
        <View className="flex flex-row gap-4">
          <View className="flex-[3]">
            <OutlinedTextInput label="Name of TODAs" value={todaName} onChangeText={setTodaName} />
          </View>
          <View className="flex-[1]">
            <OutlinedTextInput label="Color" value={color} onChangeText={setColor} />
          </View>
        </View>
        <OutlinedTextInput label="Landmark Information" value={landmark} onChangeText={setLandmark} />
        <PrimaryButton label="Submit" onPress={handleSubmit} />
      </BottomSheetView>
    </BottomSheet>
  );
}
