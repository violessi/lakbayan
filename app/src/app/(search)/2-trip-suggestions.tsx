import { useRef } from "react";
import { useRouter } from "expo-router";
import ButtomSheet from "@gorhom/bottom-sheet";
import { Text, SafeAreaView, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";
import PrimaryButton from "@components/ui/PrimaryButton";
import FilterSearch from "@components/search/FilterSearch";

import { useTripSearch } from "@contexts/TripSearchContext";

export default function SuggestedTrips() {
  const router = useRouter();
  const filterSheetRef = useRef<ButtomSheet>(null);
  const { tripEndpoints, filteredTrips, filters, applyFilters, setTrip } = useTripSearch();

  const handleSelectTrip = (trip: TripSearch) => {
    setTrip(trip);
    router.push("/(search)/3-trip-overview");
  };

  const handleOpenFilters = () => filterSheetRef.current?.snapToIndex(1);
  const prevCallback = () => router.replace("/(search)/1-search-trip");

  return (
    <SafeAreaView className="flex-1">
      <Header prevCallback={prevCallback} title="Suggested Trips" />

      <View className="px-4 pb-0 pt-5">
        <View className="flex-row items-center flex-wrap justify-center">
          <Text className="text-md font-bold flex-shrink">{tripEndpoints!.startLocation}</Text>
          <MaterialIcons name="arrow-forward" size={10} color="black" className="px-2" />
          <Text className="text-md font-bold flex-shrink">{tripEndpoints!.endLocation}</Text>
        </View>
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
