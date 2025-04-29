import React from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";
import TransportModeInput from "@components/contribute/TransportModeInput";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { useTripCreator } from "@contexts/TripCreator";
import PrimaryButtonOutline from "@components/ui/PrimaryButtonOutline";

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

  React.useEffect(() => {
    if (route.segmentMode === "Walk" && !route.segmentName.toLowerCase().includes("walk")) {
      updateRoute({ segmentName: `Walk from ${route.startLocation} to ${route.endLocation}` });
    } else if (route.segmentName.toLowerCase().includes("walk")) {
      updateRoute({ segmentName: "" });
    } else {
      updateRoute({ segmentName: route.segmentName });
    }
  }, [route.segmentMode]);

  const handleEditRoute = () => {
    setIsEditingWaypoints(true);
    sheetRef.current?.close();
  };

  return (
    <BottomSheet ref={sheetRef} enableDynamicSizing>
      <BottomSheetScrollView className="flex flex-col mx-4 pb-20">
        <Text className="text-2xl font-bold mb-4">Route Information</Text>
        <View className="flex flex-col gap-2">
          <ScrollView horizontal scrollEnabled showsHorizontalScrollIndicator={true}>
            <TransportModeInput
              value={route.segmentMode}
              onChange={(segmentMode) => updateRoute({ segmentMode })}
            />
          </ScrollView>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <OutlinedTextInput
                label="Route Name"
                value={route.segmentName.startsWith("Walk") ? "Walk" : route.segmentName}
                editable={route.segmentMode !== "Walk"}
                disabled={route.segmentMode === "Walk"}
                onChangeText={(segmentName) => updateRoute({ segmentName })}
              />
            </View>
            <View className="flex-1">
              <OutlinedTextInput
                label="Cost"
                value={String(route.cost) ?? ""}
                editable={route.segmentMode !== "Walk"}
                disabled={route.segmentMode === "Walk"}
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
        <View className="flex flex-row gap-2 p-5 mb-5 w-full justify-center">
          <PrimaryButtonOutline onPress={() => handleEditRoute()}>Edit Route</PrimaryButtonOutline>
          <PrimaryButton label={"Submit Route"} onPress={() => handleSubmit()} />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
