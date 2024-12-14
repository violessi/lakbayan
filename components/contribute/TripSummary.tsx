import React from "react";
import { Text, View, FlatList } from "react-native";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { Trip } from "@/types/route-types";

interface TripSummaryProps {
  startLocation: string;
  endLocation: string;
  trip: Trip;
}

export default function TripSummary({ startLocation, endLocation, trip }: TripSummaryProps) {
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
          {trip.routes.length === 0 ? (
            <Text className="text-secondary">No transfers added yet.</Text>
          ) : (
            <View>
              <Text>Trip Review</Text>
              <FlatList
                data={trip.routes}
                renderItem={({ item }) => (
                  <View>
                    <Text>{item.routeName}</Text>
                    <Text>{item.landmark}</Text>
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />
            </View>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
