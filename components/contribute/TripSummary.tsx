import React from "react";
import { Text, View } from "react-native";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

interface TripSummaryProps {
  startLocation: string;
  endLocation: string;
}

export default function TripSummary({ startLocation, endLocation }: TripSummaryProps) {
  const snapPoints = ["30%", "90%"];

  return (
    <BottomSheet snapPoints={snapPoints} index={1}>
      <BottomSheetView className="flex flex-col px-5 gap-8">
        <View className="flex">
          <Text className="text-lg font-bold">{startLocation}</Text>
          <Text className="text-lg"> to </Text>
          <Text className="text-lg font-bold">{endLocation}</Text>
        </View>
        <View className="flex flex-row justify-center">
          <Text className="text-secondary">No transfers added yet.</Text>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
