import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Text, SafeAreaView, View, Pressable } from "react-native";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";
import PrimaryButton from "@components/ui/PrimaryButton";
import FilterSearch from "@components/search/FilterSearch";

import { useTripSearch } from "@contexts/TripSearch";

export default function SuggestedTrips() {
  const router = useRouter();
  const { tripEndpoints, filteredTrips, filters, applyFilters, setTrip } = useTripSearch();
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const handlePress = (trip: TripSearch) => {
    setTrip(trip);
    router.push("/(search)/3-trip-overview");
  };

  return (
    <SafeAreaView className="flex-1">
      <View>
        <Header title="Suggested Trips" />
      </View>

      <View className="p-4">
        <Text className="text-lg font-bold">From: {tripEndpoints!.startLocation}</Text>
        <Text className="text-lg font-bold">To: {tripEndpoints!.endLocation}</Text>
      </View>

      {filteredTrips.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text>No trips match your selected locations.</Text>
        </View>
      ) : (
        <View className="flex-1 p-4">
          {filteredTrips.map((trip) => (
            <Pressable key={trip.id} onPress={() => handlePress(trip)}>
              <TripPreview trip={trip} />
            </Pressable>
          ))}
        </View>
      )}

      <View className="p-4">
        <PrimaryButton label="Filter" onPress={() => setIsFilterVisible(true)} />
      </View>

      {isFilterVisible && (
        <FilterSearch
          onClose={() => setIsFilterVisible(false)}
          filters={filters}
          applyFilters={applyFilters}
        />
      )}
    </SafeAreaView>
  );
}
