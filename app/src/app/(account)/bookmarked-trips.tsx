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
import { getBookmarks } from "@services/socials-service";
import { useTripData } from "@hooks/use-trip-data";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

export default function BookmarkedTrips() {
  const { user } = useSession();
  const { tripData, segmentData, loading: tripsLoading } = useTripData();

  const [bookmarkedTrips, setBookmarkedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      setLoading(true);
      const tripIds = await getBookmarks(user.id);

      const filteredTrips = tripData.filter((trip) => tripIds.includes(trip.id));
      setBookmarkedTrips(filteredTrips);

      setLoading(false);
    };

    if (!tripsLoading) {
      fetchBookmarks();
    }
  }, [user, tripData, tripsLoading]);

  function handleTripPress(trip: Trip) {
    router.push({
      pathname: "/(search)/3-trip-overview",
      params: {
        trip: JSON.stringify(trip),
        segments: JSON.stringify(segmentData[trip.id] || []),
      },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Bookmarked Trips" />
      <View className="flex-1 p-4">
        {loading || tripsLoading ? (
          <ActivityIndicator size="small" />
        ) : bookmarkedTrips.length === 0 ? (
          <Text>No bookmarked trips</Text>
        ) : (
          <FlatList
            data={bookmarkedTrips}
            keyExtractor={(trip) => trip.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleTripPress(item)}>
                <TripPreview trip={item} segments={segmentData[item.id] || []} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
