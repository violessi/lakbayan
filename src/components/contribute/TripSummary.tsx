import React from "react";
import { Text, View, FlatList } from "react-native";
import RouteItem from "@components/ui/RouteItem";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

interface TripSummaryProps {
  startLocation: string;
  endLocation: string;
  segments: Segment[];
}

export default function TripSummary({
  startLocation,
  endLocation,
  segments,
}: TripSummaryProps) {
  const snapPoints = ["15%", "25%", "72%"];

  /* FIXME: Move colors to constant */
  const routeColors = ["#FF5733", "#3357FF", "#F3FF33", "#FF33A6"];

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetView className="flex flex-col px-5 gap-8">
        <View className="flex flex-row justify-center">
          {segments.length === 0 ? (
            <Text className="text-secondary mt-5">
              No transfers added yet.
            </Text>
          ) : (
            <FlatList
              data={segments}
              renderItem={({ item, index }) => (
                <RouteItem
                  segment={item}
                  color={routeColors[index % routeColors.length]}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
