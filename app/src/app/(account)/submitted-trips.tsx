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
import { useUserTrips } from "@hooks/use-trip-data";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

export default function SubmittedTrips() {
  const { user } = useSession();
  const router = useRouter();

  const { userTrips, loading: tripsLoading } = useUserTrips(user?.id || "");
  const [loading, setLoading] = useState(true);
  const [submittedTrips, setSubmittedTrips] = useState<TripSearch[]>([]);

  useEffect(() => {
    if (!user || tripsLoading) return;

    setLoading(true);

    const preparedTrips: TripSearch[] = userTrips.map((trip) => ({
      ...trip,
      preSegment: null,
      postSegment: null,
    }));

    setSubmittedTrips(preparedTrips);
    setLoading(false);
  }, [user, userTrips, tripsLoading]);

  function handleTripPress(trip: TripSearch) {
    router.push({
      pathname: "/(search)/3-trip-overview",
      params: { tripData: JSON.stringify(trip) },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Submitted Trips" />
      <View className="flex-1 p-4">
        {loading || tripsLoading ? (
          <ActivityIndicator size="small" />
        ) : submittedTrips.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text>No submitted trips</Text>
          </View>
        ) : (
          <FlatList
            data={submittedTrips}
            keyExtractor={(trip) => trip.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleTripPress(item)}>
                <TripPreview trip={item} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
