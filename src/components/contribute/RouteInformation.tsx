import React from "react";
import { Text, Keyboard } from "react-native";

import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

interface RouteInformationProps {
  onRouteNameChange: (routeName: string) => void;
  onLandmarkChange: (landmark: string) => void;
  routeName: string;
  landmark: string;
  onSubmit: () => void;
}

export default function RouteInformation({
  onRouteNameChange,
  onLandmarkChange,
  routeName,
  landmark,
  onSubmit,
}: RouteInformationProps) {
  const snapPoints = [300];

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <Text className="text-xl font-bold">Route Information</Text>
        <OutlinedTextInput label="Route Name" value={routeName} onChangeText={onRouteNameChange} />
        <OutlinedTextInput label="Landmark Information" value={landmark} onChangeText={onLandmarkChange} />
        <PrimaryButton label="Add" onPress={onSubmit} />
      </BottomSheetView>
    </BottomSheet>
  );
}
