import React from "react";
import RouteItem from "@components/ui/RouteItem";
import { Text, View, FlatList, Pressable } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

interface TripSummaryProps {
  segments: CreateSegment[];
  editSegment: (index: number) => void;
  deleteSegment: () => void;
}

const snapPoints = ["15%", "25%", "40%", "72%"];

export default function TripSummary({ segments, editSegment, deleteSegment }: TripSummaryProps) {
  if (!segments.length) return null;

  return (
    <BottomSheet snapPoints={snapPoints} index={2} maxDynamicContentSize={50}>
      <View className="flex flex-row justify-center">
        <View className="gap-4">
          <Pressable onPress={deleteSegment} className="bg-red-200 p-3 mx-5 rounded-2xl">
            <Text className="text-center text-md font-semibold text-red-900">
              Remove Last Segment
            </Text>
          </Pressable>
          <BottomSheetScrollView className="flex flex-col px-5 gap-8">
            <FlatList
              data={segments}
              inverted={true}
              renderItem={({ item, index }) => (
                <Pressable onPress={() => editSegment(index)}>
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
      </View>
    </BottomSheet>
  );
}
