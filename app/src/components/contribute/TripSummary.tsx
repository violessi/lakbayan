import React from "react";
import { Text, View, FlatList } from "react-native";
import RouteItem from "@components/ui/RouteItem";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
import { Pressable } from "react-native-gesture-handler";

interface TripSummaryProps {
  startLocation: string;
  endLocation: string;
  segments: CreateSegment[];
  onSegmentPress: (index: number) => void;
}

export default function TripSummary({ startLocation, endLocation, segments, onSegmentPress }: TripSummaryProps) {
  const snapPoints = ["15%", "25%", "40%", "72%"];

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetScrollView className="flex flex-col px-5 gap-8">
        <View className="flex flex-row justify-center">
          {segments.length === 0 ? (
            <Text className="text-secondary mt-5">No transfers added yet.</Text>
          ) : (
            <FlatList
              data={segments}
              renderItem={({ item, index }) => (
                <Pressable onPress={() => onSegmentPress(index)}>
                  <RouteItem
                    segment={item}
                    color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
                  />
                </Pressable>
              )}
              keyExtractor={(item) => item.segmentName}
            />
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
