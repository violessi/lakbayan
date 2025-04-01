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
            {undo && (
              <Pressable onPress={undo} className="bg-gray-200 p-3 rounded-md">
                <Text className="text-center text-lg font-semibold">Undo</Text>
              </Pressable>
            )}
    </BottomSheet>
  );
}
