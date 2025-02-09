import React from "react";
import { Text, SafeAreaView, View, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Header from "../../components/ui/Header";
import TripPreview from "../../components/ui/TripPreview";
import { useTripData } from "@hooks/use-trip-data"; // Import the hook

export default function SuggestedTrips() {
  const router = useRouter();
  const tripId = "b5cb64a9-3953-4ba5-80a4-48704f625f99";

  const { tripData, segmentData, loading, error } = useTripData(tripId);

  const handlePress = () => {
    if (tripData && segmentData.length > 0) {
      router.push({
        pathname: "/(search)/trip-overview",
        params: {
          trip: JSON.stringify(tripData),
          segments: JSON.stringify(segmentData),
        },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Error fetching trip: {error}</Text>
      </SafeAreaView>
    );
  }

  if (!tripData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>No trip data found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View>
        <Header title="Suggested Trips" />
      </View>
      <View className="flex-1 p-4">
        <Pressable onPress={handlePress}>
          <TripPreview trip={tripData} segments={segmentData} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
