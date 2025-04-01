import React from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

import { useSession } from "@contexts/SessionContext";
import { useBookmarks } from "@hooks/use-bookmarks";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

export default function BookmarkedTrips() {
  const { user } = useSession();
  const { bookmarks, loading } = useBookmarks(user?.id || null);
  const router = useRouter();

  function handleTripPress(trip: FullTrip) {
    const tripSearch: TripSearch = {
      ...trip,
      segments: trip.segments,
      preSegment: null,
      postSegment: null,
    };

    router.push({
      pathname: "/(search)/3-trip-overview",
      params: { tripData: JSON.stringify(tripSearch) },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Bookmarked Trips" />
      <View className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator size="small" testID="activity-indicator" />
        ) : bookmarks.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text>No bookmarked trips</Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
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
