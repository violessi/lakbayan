import React from "react";
import { Text, View, FlatList, Pressable } from "react-native";
import RouteItem from "@components/ui/RouteItem";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

interface TripSummaryProps {
  startLocation: string;
  endLocation: string;
  segments: CreateSegment[];
  onSegmentPress: (index: number) => void;
  undo?: () => void;
}

export default function TripSummary({ startLocation, endLocation, segments, onSegmentPress, undo }: TripSummaryProps) {
  const snapPoints = ["15%", "25%", "40%", "72%"];

  return (
    <BottomSheet snapPoints={snapPoints} index={2} maxDynamicContentSize={50}>
      <View className="flex flex-row justify-center">
        {segments.length === 0 ? (
          <Text className="text-secondary mt-5">No transfers added yet.</Text>
        ) : (
          <View className="gap-4">
            {undo && (
              <Pressable onPress={undo} className="bg-gray-200 p-3 rounded-md">
                <Text className="text-center text-lg font-semibold">Undo</Text>
              </Pressable>
            )}
            <BottomSheetScrollView className="flex flex-col px-5 gap-8">
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
              <View className="h-40"></View>
            </BottomSheetScrollView>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}
