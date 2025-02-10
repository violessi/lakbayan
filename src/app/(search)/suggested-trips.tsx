import React, { useState, useMemo, useEffect } from "react";
import { Text, SafeAreaView, View, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { useTripData } from "@hooks/use-trip-data";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";
import PrimaryButton from "@components/ui/PrimaryButton";
import FilterSearch from "@components/search/FilterSearch";

const haversineDistance = (coord1: [number, number], coord2: [number, number]) => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
};

export default function SuggestedTrips() {
  const router = useRouter();
  const { startLocation, endLocation, startCoords, endCoords } = useLocalSearchParams();
  const { tripData, segmentData, loading, error } = useTripData();

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: "Verified by moderators",
    transportModes: ["Train", "Bus", "Jeep", "UV", "Tricycle"],
  });

  const [filteredTrips, setFilteredTrips] = useState([]);

  const startCoordinates = useMemo(() => (startCoords ? JSON.parse(startCoords) : [0, 0]), [startCoords]);
  const endCoordinates = useMemo(() => (endCoords ? JSON.parse(endCoords) : [0, 0]), [endCoords]);

  const tripsWithSegments = useMemo(() => {
    return tripData.map((trip) => ({
      ...trip,
      segments: segmentData[trip.id] || [],
    }));
  }, [tripData, segmentData]);

  useEffect(() => {
    let updatedTrips = tripsWithSegments
      .map((trip) => {
        if (!trip.segments || trip.segments.length === 0) return null;

        const firstSegment = trip.segments[0];
        const lastSegment = trip.segments[trip.segments.length - 1];

        const startDist = haversineDistance(startCoordinates, firstSegment.start_coords);
        const endDist = haversineDistance(endCoordinates, lastSegment.end_coords);

        const walkingToStartSegment =
          startDist > 0 && startLocation !== firstSegment.start_location
            ? {
                id: `walk-start-${trip.id}`,
                segment_mode: "Walk",
                waypoints: [startCoordinates, firstSegment.start_coords],
                start_location: startLocation,
                start_coords: startCoordinates,
                end_location: firstSegment.start_location,
                end_coords: firstSegment.start_coords,
                duration: (startDist / 80) * 60,
              }
            : null;

        const walkingToEndSegment =
          endDist > 0 && endLocation !== lastSegment.end_location
            ? {
                id: `walk-end-${trip.id}`,
                segment_mode: "Walk",
                waypoints: [lastSegment.end_coords, endCoordinates],
                start_location: lastSegment.end_location,
                start_coords: lastSegment.end_coords,
                end_location: endLocation,
                end_coords: endCoordinates,
                duration: (endDist / 80) * 60,
              }
            : null;

        const updatedSegments = [
          ...(walkingToStartSegment ? [walkingToStartSegment] : []),
          ...trip.segments,
          ...(walkingToEndSegment ? [walkingToEndSegment] : []),
        ];

        return {
          ...trip,
          segments: updatedSegments,
          isWithinStartRange: startDist <= 1500,
          isWithinEndRange: endDist <= 1500,
        };
      })
      .filter((trip) => trip && trip.isWithinStartRange && trip.isWithinEndRange);

    updatedTrips = updatedTrips.filter((trip) =>
      trip.segments.every(
        (segment) => segment.segment_mode === "Walk" || filters.transportModes.includes(segment.segment_mode),
      ),
    );

    switch (filters.sortBy) {
      case "Verified by moderators":
        updatedTrips.sort((a, b) => (b.mod_verified || 0) - (a.mod_verified || 0));
        break;
      case "Verified by GPS":
        updatedTrips.sort((a, b) => (b.gps_verified || 0) - (a.gps_verified || 0));
        break;
      case "Votes":
        updatedTrips.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        break;
      case "Duration":
        updatedTrips.sort((a, b) => {
          const durationA = a.segments?.reduce((acc, seg) => acc + (seg.duration || 0), 0) ?? Infinity;
          const durationB = b.segments?.reduce((acc, seg) => acc + (seg.duration || 0), 0) ?? Infinity;
          return durationA - durationB;
        });
        break;
    }

    setFilteredTrips(updatedTrips);
  }, [tripsWithSegments, filters, startCoordinates, endCoordinates]);

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

  return (
    <SafeAreaView className="flex-1">
      <View>
        <Header title="Suggested Trips" />
      </View>

      <View className="p-4">
        <Text className="text-lg font-bold">From: {startLocation}</Text>
        <Text className="text-lg font-bold">To: {endLocation}</Text>
      </View>

      {filteredTrips.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text>No trips match your selected locations.</Text>
        </View>
      ) : (
        <View className="flex-1 p-4">
          {filteredTrips.map((trip) => (
            <Pressable key={trip.id} onPress={() => handlePress(trip)}>
              <TripPreview trip={trip} segments={trip.segments} />
            </Pressable>
          ))}
        </View>
      )}

      <View className="p-4">
        <PrimaryButton label="Filter" onPress={() => setIsFilterVisible(true)} />
      </View>

      {isFilterVisible && (
        <FilterSearch onClose={() => setIsFilterVisible(false)} filters={filters} setFilters={setFilters} />
      )}
    </SafeAreaView>
  );
}
