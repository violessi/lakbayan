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
import { useTripData } from "@hooks/use-trip-data";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

export default function SubmittedTrips() {
  const { user } = useSession();
  const { tripData, segmentData, loading: tripsLoading } = useTripData();

  const [submittedTrips, setSubmittedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!user || tripsLoading) return;

    setLoading(true);

    // Filter trips where the user is the contributor
    const userTrips = tripData.filter((trip) => trip.contributorId === user.id);
    setSubmittedTrips(userTrips);

    setLoading(false);
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
      <Header title="Submitted Trips" />
      <View className="flex-1 p-4">
        {loading || tripsLoading ? (
          <ActivityIndicator size="small" />
        ) : submittedTrips.length === 0 ? (
          <Text>No submitted trips</Text>
        ) : (
          <FlatList
            data={submittedTrips}
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
