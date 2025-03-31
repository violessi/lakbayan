import React from "react";
import { Text, Pressable } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

import { useTransitJournal } from "@contexts/TransitJournal";

export default function RecentTrips() {
  const snapPoints = ["20%"];
  const { hasActiveTransitJournal } = useTransitJournal();
  const router = useRouter();

  return (
    <BottomSheet snapPoints={snapPoints} index={1}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <Text className="text-xl font-bold">Recent Trips</Text>
        {hasActiveTransitJournal && (
          <Pressable onPress={() => router.push("/(journal)/transit-journal")}>
            <Text className="text-blue-500 underline">Active Transit Journal</Text>
          </Pressable>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}
