import React, { useMemo, useCallback } from "react";
import { Text, View } from "react-native";

import OutlinedTextInput from "@components/ui/OutlinedTextInput";
import PrimaryButton from "@components/ui/PrimaryButton";
import TransportationModeSelection from "@components/contribute/TransportationModeSelection";
import {
  BottomSheetView,
  BottomSheetModal,
  BottomSheetBackgroundProps,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

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
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  updateRoute: (updates: Partial<CreateSegment>) => void;
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
  bottomSheetModalRef,
  updateRoute,
}: RouteInformationProps) {
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackgroundProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={"close"}
      />
    ),
    [],
  );

  return (
    <View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        index={2}
        backdropComponent={renderBackdrop}
        keyboardBehavior={"extend"}
      >
        <BottomSheetView className="flex flex-col px-5 gap-4">
          <Text className="text-xl font-bold">Route Information</Text>
          <TransportationModeSelection
            onTransportationModeChange={(segmentMode) => updateRoute({ segmentMode })}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <OutlinedTextInput
                label="Route Name"
                value={routeName}
                onChangeText={onRouteNameChange}
              />
            </View>
            <View className="flex-1">
              <OutlinedTextInput label="Cost" value={cost} onChangeText={onCostChange} />
            </View>
          </View>
          <OutlinedTextInput label="Landmark" value={landmark} onChangeText={onLandmarkChange} />
          <OutlinedTextInput
            label="Instruction"
            value={instruction}
            onChangeText={onInstructionChange}
          />
          <View className="z-50 flex p-5 w-100">
            <PrimaryButton label="Submit" onPress={onSubmit} />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
