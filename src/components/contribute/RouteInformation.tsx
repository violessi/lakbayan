import React from "react";
import { Text, Keyboard, View } from "react-native";

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
  const snapPoints = ["29%"];

  return (
    <>
      <BottomSheet snapPoints={snapPoints} index={1}>
        <BottomSheetView className="flex flex-col px-5 gap-2">
          <Text className="text-xl font-bold">Route Information</Text>
          <OutlinedTextInput label="Route Name" value={routeName} onChangeText={onRouteNameChange} />
          <OutlinedTextInput label="Landmark Information" value={landmark} onChangeText={onLandmarkChange} />
        </BottomSheetView>
      </BottomSheet>
      <View className="z-50 flex px-5 w-100">
        <PrimaryButton label="Final Location" onPress={onSubmit} />
      </View>
    </>
  );
}
