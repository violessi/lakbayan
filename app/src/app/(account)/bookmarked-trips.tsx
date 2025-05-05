import React from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import { useSession } from "@contexts/SessionContext";
import { useBookmarks } from "@hooks/use-bookmarks";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

import { SourceDestinationTitle } from "@components/ui/SourceDestinationTitle";

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

    router.replace({
      pathname: "/(search)/3-trip-overview",
      params: { tripData: JSON.stringify(tripSearch), from: "bookmarked-trips" },
    });
  }

  // navigation
  function prevCallback() {
    router.replace("/(tabs)/account");
  }

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        prevCallback();
        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

      return () => backHandler.remove();
    }, []),
  );

  return (
    <SafeAreaView className="flex-1">
      <Header title="Bookmarked Trips" />
      <View className="flex-1 px-4">
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
              <View className="flex flex-col justify-center mt-2">
                <TouchableOpacity onPress={() => handleTripPress(trip)}>
                  <SourceDestinationTitle
                    start={trip.startLocation ?? ""}
                    end={trip.endLocation ?? ""}
                  />
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
