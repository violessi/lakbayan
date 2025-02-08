import React from "react";
import { Text, Keyboard, View } from "react-native";

import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

interface RouteInformationProps {
  onRouteNameChange: (routeName: string) => void;
  onLandmarkChange: (landmark: string) => void;
  onInstructionChange: (instruction: string) => void;
  onCostChange: (cost: string) => void;
  routeName: string;
  landmark: string;
  instruction: string;
  cost: string;
  onSubmit: () => void;
}

export default function RouteInformation({
  onRouteNameChange,
  onLandmarkChange,
  onInstructionChange,
  onCostChange,
  routeName,
  landmark,
  instruction,
  cost,
  onSubmit,
}: RouteInformationProps) {
  const snapPoints = ["40%"];

  return (
    <>
      <BottomSheet snapPoints={snapPoints} index={1}>
        <BottomSheetView className="flex flex-col px-5 gap-2">
          <Text className="text-xl font-bold">Route Information</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <OutlinedTextInput label="Route Name" value={routeName} onChangeText={onRouteNameChange} />
            </View>
            <View className="flex-1">
              <OutlinedTextInput label="Cost" value={cost} onChangeText={onCostChange} />
            </View>
          </View>
          <OutlinedTextInput label="Landmark" value={landmark} onChangeText={onLandmarkChange} />
          <OutlinedTextInput label="Instruction" value={instruction} onChangeText={onInstructionChange} />
        </BottomSheetView>
      </BottomSheet>
      <View className="z-50 flex p-5 w-100">
        <PrimaryButton label="Submit" onPress={onSubmit} />
      </View>
    </>
  );
}
