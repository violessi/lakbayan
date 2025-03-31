import React, { useEffect, useState } from "react";
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
import { fetchBookmarks } from "@services/socials-service";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

export default function BookmarkedTrips() {
  const { user } = useSession();

  const [bookmarkedTrips, setBookmarkedTrips] = useState<FullTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) return;
      setLoading(true);

      const trips = await fetchBookmarks(user.id);
      setBookmarkedTrips(trips);

      setLoading(false);
    };

    loadBookmarks();
  }, [user]);

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
          <ActivityIndicator size="small" />
        ) : bookmarkedTrips.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text>No bookmarked trips</Text>
          </View>
        ) : (
          <FlatList
            data={bookmarkedTrips}
            keyExtractor={(trip) => trip.id}
            renderItem={({ item }) => (
              <View className="flex flex-col justify-center mt-5">
                <TouchableOpacity onPress={() => handleTripPress(item)}>
                  <View className="flex flex-row justify-center">
                    <Text className="text-sm font-bold">
                      {item.startLocation} to {item.endLocation}
                    </Text>
                  </View>
                  <View>
                    <TripPreview trip={item} />
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
