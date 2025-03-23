import React, { useEffect, useState } from "react";
import { SafeAreaView, View, FlatList, ActivityIndicator, Text } from "react-native";

import { useSession } from "@contexts/SessionContext";
import { getBookmarks } from "@services/socials-service";
import { useTripData } from "@hooks/use-trip-data";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

export default function BookmarkedTrips() {
  const { userId } = useSession();
  const { tripData, segmentData, loading: tripsLoading } = useTripData();
  const [bookmarkedTrips, setBookmarkedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!userId) return;

      setLoading(true);
      const tripIds = await getBookmarks(userId);

      const filteredTrips = tripData.filter((trip) => tripIds.includes(trip.id));
      setBookmarkedTrips(filteredTrips);

      setLoading(false);
    };

    if (!tripsLoading) {
      fetchBookmarks();
    }
  }, [userId, tripData, tripsLoading]);

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
            renderItem={({ item }) => <TripPreview trip={item} segments={segmentData[item.id] || []} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
