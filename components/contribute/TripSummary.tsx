import React from "react";
import { Text, View, FlatList } from "react-native";
import RouteItem from "@/components/contribute/RouteItem";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { Trip } from "@/types/route-types";

interface TripSummaryProps {
  startLocation: string;
  endLocation: string;
  trip: Trip;
}

export default function TripSummary({ startLocation, endLocation, trip }: TripSummaryProps) {
  const snapPoints = ["15%", "25%", "72%"];

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetView className="flex flex-col px-5 gap-8">
        <View className="flex flex-row justify-center">
          {trip.routes.length === 0 ? (
            <Text className="text-secondary">No transfers added yet.</Text>
          ) : (
            <FlatList
              data={trip.routes}
              renderItem={({ item }) => <RouteItem route={item} />}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
