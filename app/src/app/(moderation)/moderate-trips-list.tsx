import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";

import { useSession } from "@contexts/SessionContext";
import { usePendingVerifications } from "@hooks/use-pending-verifications";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

export default function ModerateTripsList() {
  const { user } = useSession();
  const { pendingTrips, pendingTodas, loading, refetch } = usePendingVerifications(
    user?.id || null,
  );
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  function handleTripPress(trip: FullTrip) {
    const tripSearch: TripSearch = {
      ...trip,
      preSegment: null,
      postSegment: null,
    };

    router.push({
      pathname: "/(moderation)/moderate-trip-review",
      params: {
        tripData: JSON.stringify(tripSearch),
      },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Community Moderation" />
      <View className="flex-1 p-4">
        <Text className="text-black text-xl font-bold mb-4">Pending Verifications</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" testID="activity-indicator" />
        ) : pendingTrips.length === 0 ? (
          <Text className="text-gray-500">No pending verifications.</Text>
        ) : (
          <FlatList
            data={pendingTrips}
            keyExtractor={(trip) => trip.id}
            renderItem={({ item: trip }) => (
              <View className="flex flex-col justify-center mt-5">
                <TouchableOpacity onPress={() => handleTripPress(trip)}>
                  <View className="flex flex-row justify-center">
                    <Text className="text-sm text-center">
                      {trip.startLocation} to {trip.endLocation}
                    </Text>
                  </View>
                  <View>
                    <TripPreview trip={trip} />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
