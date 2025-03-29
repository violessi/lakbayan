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
  isEditingRoute: boolean;
  handleToggleMode: () => void;
  clearWaypoints: () => void;
  getRouteDirections: () => void;
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
  isEditingRoute,
  handleToggleMode,
  clearWaypoints,
  getRouteDirections,
}: RouteInformationProps) {
  const snapPoints = ["40%"];

  return (
    <>
      <View className="absolute bottom-[350px] flex flex-col gap-4 w-full z-0">
        <View className="flex-row z-10">
          <View className="flex-1 pl-3 pr-[5px]">
            <PrimaryButton
              label={isEditingRoute ? "Recalculate" : "Edit Route"}
              onPress={handleToggleMode}
            />
          </View>
          <View className="flex-1 pr-3 pl-[5px]">
            <PrimaryButton
              label={isEditingRoute ? "Clear" : "Calculate"}
              onPress={isEditingRoute ? clearWaypoints : getRouteDirections}
            />
          </View>
        </View>
      </View>
      <BottomSheet 
        snapPoints={snapPoints} index={1} 
        enablePanDownToClose={false} // Prevent closing by dragging
        enableContentPanningGesture={false} // Disable user dragging
        enableHandlePanningGesture={false} // Disable handle dragging
      >
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
