import React, { useState, useEffect } from "react";
import { Text, SafeAreaView, View, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";
import PrimaryButton from "@components/ui/PrimaryButton";
import FilterSearch from "@components/search/FilterSearch";
import { fetchTripData } from "@services/trip-service-v2";
import { getDirections, paraphraseStep } from "@services/mapbox-service";
import { isNearLocation } from "@utils/map-utils";

// TODO: move this somewhere else
// Generates a walking segment if the start and end coordinates are different
async function generateWalkingSegment(
  startLoc: string,
  startCoords: Coordinates,
  endLoc: string,
  endCoords: Coordinates,
): Promise<Segment | null> {
  // if the distance between the current and start location < 100 meters
  // then no need to add a walking segment
  if (isNearLocation(startCoords, endCoords, 100)) return null;

  const data = await getDirections(startCoords, [], endCoords, "Walk", true);
  const directions = data.routes[0];
  const waypoints = directions.geometry.coordinates ?? [];
  const duration = directions.duration;
  const distance = directions.distance;
  const navigationSteps = directions.legs.flatMap(({ steps }) =>
    steps.map(({ maneuver }) => ({
      instruction: paraphraseStep(maneuver.instruction),
      location: maneuver.location,
    })),
  );

  const segment: Segment = {
    id: `walk-${startLoc}-${endLoc}`,
    contributorId: "system",
    segmentName: `Walk from ${startLoc} to ${endLoc}`,
    segmentMode: "Walk",
    landmark: "",
    instruction: `Walk from ${startLoc} to ${endLoc}`,
    gpsVerified: 0,
    modVerified: 0,
    duration,
    distance,
    cost: 0,
    liveStatus: [],
    waypoints,
    navigationSteps,
    startLocation: startLoc,
    startCoords,
    endLocation: endLoc,
    endCoords,
    createdAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
  };

  return segment;
}

const FILTER_INITIAL_STATE = {
  sortBy: "Verified by moderators",
  transportModes: ["Train", "Bus", "Jeep", "UV", "Tricycle"],
};

export default function SuggestedTrips() {
  const router = useRouter();
  const { params } = useLocalSearchParams();
  const tripDetails = JSON.parse(params as string) as TripDetails;

  const [fullTrips, setFullTrips] = useState<FullTrip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<FullTrip[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState(FILTER_INITIAL_STATE);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await fetchTripData(tripDetails, 1500);
        if (error) throw new Error(`Error fetching trips: ${error}`);
        if (!data) throw new Error("No trips found.");

        // FIXME: append correct pre and post segments
        const fullTrips: FullTrip[] = await Promise.all(
          data.map(async (trip) => {
            const start = await generateWalkingSegment(
              tripDetails.startLocation,
              tripDetails.startCoords,
              trip.startLocation,
              trip.startCoords,
            );
            const end = await generateWalkingSegment(
              trip.endLocation,
              trip.endCoords,
              tripDetails.endLocation,
              tripDetails.endCoords,
            );

            if (start) {
              trip.startLocation = tripDetails.startLocation;
              trip.startCoords = tripDetails.startCoords;
              trip.segments.unshift(start);
            }
            if (end) {
              trip.endLocation = tripDetails.endLocation;
              trip.endCoords = tripDetails.endCoords;
              trip.segments.push(end);
            }

            return trip;
          }),
        );

        setFullTrips(fullTrips);
      } catch (err: any) {
        setError(err.message || "Something went wrong while fetching trips.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filteredTrips: FullTrip[] = fullTrips.filter((trip) => {
      return trip.segments.every((segment) => {
        const mode = segment.segmentMode || segment.segmentMode;
        return mode === "Walk" || filters.transportModes.includes(mode);
      });
    });

    switch (filters.sortBy) {
      case "Verified by moderators":
        filteredTrips.sort((a, b) => (b.modVerified || 0) - (a.modVerified || 0));
        break;
      case "Verified by GPS":
        filteredTrips.sort((a, b) => (b.gpsVerified || 0) - (a.gpsVerified || 0));
        break;
      case "Votes":
        filteredTrips.sort(
          (a, b) => (b.upvotes || 0) - (b.downvotes || 0) - ((a.upvotes || 0) - (a.downvotes || 0)),
        );
        break;
      case "Duration":
        filteredTrips.sort((a, b) => {
          const durationA =
            a.segments?.reduce((acc, seg) => acc + (seg.duration || 0), 0) ?? Infinity;
          const durationB =
            b.segments?.reduce((acc, seg) => acc + (seg.duration || 0), 0) ?? Infinity;
          return durationA - durationB;
        });
        break;
    }
    setFilteredTrips(filteredTrips);
  }, [fullTrips, filters]);

  const handlePress = (trip: FullTrip) => {
    router.push({
      pathname: "/(search)/3-trip-overview",
      params: { params: JSON.stringify(trip) },
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
        <Text className="text-red-500">Error fetching trips: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View>
        <Header title="Suggested Trips" />
      </View>

      <View className="p-4">
        <Text className="text-lg font-bold">From: {tripDetails.startLocation}</Text>
        <Text className="text-lg font-bold">To: {tripDetails.endLocation}</Text>
      </View>

      {filteredTrips.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text>No trips match your selected locations.</Text>
        </View>
      ) : (
        <View className="flex-1 p-4">
          {filteredTrips.map((trip) => (
            <Pressable key={trip.id} onPress={() => handlePress(trip)}>
              <TripPreview trip={trip} />
            </Pressable>
          ))}
        </View>
      )}

      <View className="p-4">
        <PrimaryButton label="Filter" onPress={() => setIsFilterVisible(true)} />
      </View>

      {isFilterVisible && (
        <FilterSearch
          onClose={() => setIsFilterVisible(false)}
          filters={filters}
          setFilters={setFilters}
        />
      )}
    </SafeAreaView>
  );
}
