import React, { useState, useMemo } from "react";
import { Text, SafeAreaView, View, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

import { useTripData } from "@hooks/use-trip-data";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";
import PrimaryButton from "@components/ui/PrimaryButton";
import FilterSearch from "@components/search/FilterSearch";

export default function SuggestedTrips() {
  const router = useRouter();
  const { tripData, segmentData, loading, error } = useTripData();
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filters, setFilters] = useState({
    sortBy: "Verified by moderators",
    transportModes: ["Trains", "Bus", "Jeep", "UV Express", "Tricycle"],
  });

  // Ensure trips include their segments
  const tripsWithSegments = useMemo(() => {
    return tripData.map((trip) => ({
      ...trip,
      segments: segmentData[trip.id] || [],
    }));
  }, [tripData, segmentData]);

  // Apply filters and sorting
  const filteredTrips = useMemo(() => {
    if (tripsWithSegments.length === 0) return [];

    // Filter by transport modes
    let filtered = tripsWithSegments.filter((trip) =>
      trip.segments.some((segment) => filters.transportModes.includes(segment.segment_mode)),
    );

    // Sort by selected criteria
    switch (filters.sortBy) {
      case "Verified by moderators":
        filtered.sort((a, b) => (b.mod_verified || 0) - (a.mod_verified || 0));
        break;
      case "Verified by GPS":
        filtered.sort((a, b) => (b.gps_verified || 0) - (a.gps_verified || 0));
        break;
      case "Votes":
        filtered.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        break;
    }

    return filtered;
  }, [tripsWithSegments, filters]);

  const handlePress = (trip) => {
    router.push({
      pathname: "/(search)/trip-overview",
      params: {
        trip: JSON.stringify(trip),
        segments: JSON.stringify(trip.segments),
      },
    });
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
        <Text>Error fetching trips: {error}</Text>
      </SafeAreaView>
    );
  }

  if (filteredTrips.length === 0) {
    return (
      <SafeAreaView className="flex-1">
        <View>
          <Header title="Suggested Trips" />
        </View>
        <View className="flex-1 justify-center items-center">
          <Text>No trip data found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View>
        <Header title="Suggested Trips" />
      </View>
      <View className="flex-1 p-4">
        {filteredTrips.map((trip) => (
          <Pressable key={trip.id} onPress={() => handlePress(trip)}>
            <TripPreview trip={trip} segments={trip.segments} />
          </Pressable>
        ))}
      </View>
      <View className="p-4">
        <PrimaryButton label="Filter" onPress={() => setIsFilterVisible(true)} />
      </View>

      {/* Filter Search Bottom Sheet */}
      {isFilterVisible && (
        <FilterSearch onClose={() => setIsFilterVisible(false)} filters={filters} setFilters={setFilters} />
      )}
    </SafeAreaView>
  );
}
