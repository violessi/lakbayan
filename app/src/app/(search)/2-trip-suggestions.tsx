import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import { Text, SafeAreaView, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";
import PrimaryButton from "@components/ui/PrimaryButton";
import FilterSearch from "@components/search/FilterSearch";

import { useTripSearch } from "@contexts/TripSearchContext";
import { useSession } from "@contexts/SessionContext";
import { insertSearchLog } from "@services/logs-service";

export default function SuggestedTrips() {
  const { user } = useSession();
  const router = useRouter();
  const filterSheetRef = useRef<BottomSheet>(null);
  const { tripEndpoints, filteredTrips, filters, applyFilters, setTrip } = useTripSearch();
  if (!user) throw new Error("User must be logged in to search for a trip!");


  useEffect(() => {
    // TODO: move to context
    const logSearch = async () => {
      if (!tripEndpoints?.startLocation || !tripEndpoints?.endLocation) {
        throw Error ("Please select both a source and destination.");
      }

      await insertSearchLog({
        userId: user?.id,
        startLocation: tripEndpoints.startLocation,
        startCoords: tripEndpoints.startCoords ?? [0, 0],
        endLocation: tripEndpoints.endLocation,
        endCoords: tripEndpoints.endCoords ?? [0, 0],
        resultCount: filteredTrips.length,
        didTransitJournal: false,
      });
    };
  
    try {
      logSearch();
    } catch (error) {
      console.error("Error logging search: ", error);
    }
  }, []);
  
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
