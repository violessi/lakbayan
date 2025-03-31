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

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";

interface TripListScreenProps {
  title: string;
  trips: TripSearch[];
  loading: boolean;
  emptyText?: string;
}

export default function TripListScreen({
  title,
  trips,
  loading,
  emptyText = "No trips found",
}: TripListScreenProps) {
  const router = useRouter();

  function handleTripPress(trip: TripSearch) {
    router.push({
      pathname: "/(search)/3-trip-overview",
      params: { tripData: JSON.stringify(trip) },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title={title} />
      <View className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator size="small" />
        ) : trips.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text>{emptyText}</Text>
          </View>
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(trip) => trip.id}
            renderItem={({ item: trip }) => (
              <View className="flex flex-col justify-center mt-5">
                <TouchableOpacity onPress={() => handleTripPress(trip)}>
                  <View className="flex flex-row justify-center">
                    <Text className="text-sm text-center">
                      {trip.startLocation} to {trip.endLocation}
                    </Text>
                  </View>
                  <TripPreview trip={trip} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
