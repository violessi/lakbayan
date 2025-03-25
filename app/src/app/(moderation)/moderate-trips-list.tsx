import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView, View, FlatList, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { getPendingVerifications } from "@services/moderation-service";
import { useSession } from "@contexts/SessionContext";
import { useTripData } from "@hooks/use-trip-data";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

export default function ModerateTripsList() {
  const { user } = useSession();
  const { segmentData, loading: tripsLoading } = useTripData();
  const [pendingTrips, setPendingTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        if (!user) return;

        setLoading(true);
        const trips = await getPendingVerifications(user.id);
        setPendingTrips(trips);
        setLoading(false);
      }
      fetchData();
    }, [user]),
  );

  function handleTripPress(trip) {
    router.push({
      pathname: "/(moderation)/moderate-trip-review",
      params: {
        trip: JSON.stringify(trip),
        segments: JSON.stringify(segmentData[trip.id] || []),
      },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Community Moderation" />
      <View className="flex-1 p-4">
        <Text className="text-black text-xl font-bold mb-4">Pending Verifications</Text>

        {loading || tripsLoading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : pendingTrips.length === 0 ? (
          <Text className="text-gray-500">No pending verifications.</Text>
        ) : (
          <FlatList
            data={pendingTrips}
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
