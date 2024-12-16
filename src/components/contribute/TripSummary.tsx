import React from "react";
import { Text, View, FlatList } from "react-native";
import RouteItem from "@components/contribute/RouteItem";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

interface TripSummaryProps {
  startLocation: string;
  endLocation: string;
  trip: Trip;
}

export default function TripSummary({ startLocation, endLocation, trip }: TripSummaryProps) {
  const snapPoints = ["15%", "25%", "72%"];

  {
    /* FIXME Move colors to constant */
  }
  const routeColors = ["#FF5733", "#3357FF", "#F3FF33", "#FF33A6"];

  return (
    <BottomSheet snapPoints={snapPoints} index={2}>
      <BottomSheetView className="flex flex-col px-5 gap-8">
        <View className="flex flex-row justify-center">
          {trip.routes.length === 0 ? (
            <Text className="text-secondary">No transfers added yet.</Text>
          ) : (
            <FlatList
              data={trip.routes}
              renderItem={({ item, index }) => (
                <RouteItem route={item} color={routeColors[index % routeColors.length]} />
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
