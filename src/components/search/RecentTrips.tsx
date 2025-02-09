import React from "react";
import { Text } from "react-native";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

export default function RecentTrips() {
  const snapPoints = ["20%"];

  return (
    <BottomSheet snapPoints={snapPoints} index={1}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <Text className="text-xl font-bold">Recent Trips</Text>
      </BottomSheetView>
    </BottomSheet>
  );
}
