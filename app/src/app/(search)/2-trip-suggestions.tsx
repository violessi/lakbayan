import { useRef } from "react";
import { useRouter } from "expo-router";
import ButtomSheet from "@gorhom/bottom-sheet";
import { Text, SafeAreaView, View, Pressable } from "react-native";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";
import PrimaryButton from "@components/ui/PrimaryButton";
import FilterSearch from "@components/search/FilterSearch";

import { useTripSearch } from "@contexts/TripSearch";

export default function SuggestedTrips() {
  const router = useRouter();
  const filterSheetRef = useRef<ButtomSheet>(null);
  const { tripEndpoints, filteredTrips, filters, applyFilters, setTrip } = useTripSearch();

  const handleSelectTrip = (trip: TripSearch) => {
    setTrip(trip);
    router.push("/(search)/3-trip-overview");
  };

  const handleOpenFilters = () => filterSheetRef.current?.expand();
  const prevCallback = () => router.replace("/(search)/1-search-trip");

  return (
    <SafeAreaView className="flex-1">
      <Header prevCallback={prevCallback} title="Suggested Trips" />

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
            <Pressable key={trip.id} onPress={() => handleSelectTrip(trip)}>
              <TripPreview trip={trip} />
            </Pressable>
          ))}
        </View>
      )}

      <View className="p-4">
        <PrimaryButton label="Filter" onPress={handleOpenFilters} />
      </View>

      <FilterSearch sheetRef={filterSheetRef} filters={filters} applyFilters={applyFilters} />
    </SafeAreaView>
  );
}
