import React from "react";
import { Text, View } from "react-native";

import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";
import TransportModeInput from "@components/contribute/TransportModeInput";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { useTripCreator } from "@contexts/TripCreator";

interface RouteInformationProps {
  sheetRef: React.RefObject<BottomSheet>;
  handleSubmit: () => void;
  setIsEditingWaypoints: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RouteInformation({
  sheetRef,
  handleSubmit,
  setIsEditingWaypoints,
}: RouteInformationProps) {
  const { route, updateRoute } = useTripCreator();
  const snapPoints = ["25%", "50%"];

  const handleEditRoute = () => {
    setIsEditingWaypoints(true);
    sheetRef.current?.close();
  };

  return (
    <BottomSheet ref={sheetRef} snapPoints={snapPoints} index={1}>
      <BottomSheetScrollView className="flex flex-col mx-4">
        <Text className="text-2xl font-bold mb-4">Route Information</Text>
        <View className="flex flex-col gap-2">
          <TransportModeInput
            value={route.segmentMode}
            onChange={(segmentMode) => updateRoute({ segmentMode })}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <OutlinedTextInput
                label="Route Name"
                value={route.segmentName}
                onChangeText={(segmentName) => updateRoute({ segmentName })}
              />
            </View>
            <View className="flex-1">
              <OutlinedTextInput
                label="Cost"
                value={String(route.cost) ?? ""}
                onChangeText={(cost) => {
                  const parsedCost = Number(cost);
                  updateRoute({ cost: isNaN(parsedCost) ? 0 : parsedCost });
                }}
              />
            </View>
          </View>
          <OutlinedTextInput
            label="Landmark"
            value={route.landmark ?? ""}
            onChangeText={(landmark) => updateRoute({ landmark })}
          />
          <OutlinedTextInput
            label="Instruction"
            value={route.instruction ?? ""}
            onChangeText={(instruction) => updateRoute({ instruction })}
          />
        </View>
        <View className="flex flex-row gap-2 p-5 w-full justify-center">
          <PrimaryButton label={"Submit Route"} onPress={() => handleSubmit()} />
          <PrimaryButton label={"Edit Route"} onPress={() => handleEditRoute()} />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
