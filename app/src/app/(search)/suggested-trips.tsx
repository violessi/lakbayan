import React, { useState, useMemo, useEffect } from "react";
import { Text, SafeAreaView, View, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import Header from "@components/ui/Header";
import TripPreview from "@components/ui/TripPreview";
import PrimaryButton from "@components/ui/PrimaryButton";
import FilterSearch from "@components/search/FilterSearch";

import { supabase } from "@utils/supabase";

// const haversineDistance = (coord1: [number, number], coord2: [number, number]) => {
//   const [lat1, lon1] = coord1;
//   const [lat2, lon2] = coord2;
//   const R = 6371;
//   const toRad = (deg: number) => (deg * Math.PI) / 180;

//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c * 1000;
// };

async function fetchTripData(tripDetails: TripDetails, radius: number) {
  try{
    console.log("FETCHING DATA: ",tripDetails);
    const {data, error} = await supabase.rpc("get_nearby_trips", {
      start_lat: tripDetails.startCoords[1],
      start_lon: tripDetails.startCoords[0],
      end_lat: tripDetails.endCoords[1],
      end_lon: tripDetails.endCoords[0],
      radius,
    });
  
    if (error) {
      throw new Error(error.message);
    }

    console.log("FETCHED DATA: ",data);
    console.log("Segments:", JSON.stringify(data[0].segments, null, 2));
    return data;

  } catch (error) {
    return { error };
  }
}

function generateWalkingSegment(startLoc: string, startCoords: Coordinates, endLoc: string, endCoords: Coordinates){ 
  const walkingSegment = startCoords === endCoords ? null : {
    id: `walk-${startLoc}-${endLoc}`,
    segmentMode: "Walk",
    startLocation: startLoc,
    startCoords: startCoords,
    endLocation: endLoc,
    endCoords: endCoords,
    duration: 0,
  };
  return walkingSegment;
}

export default function SuggestedTrips() {
  const router = useRouter();
  const { startLocation, endLocation, startCoords, endCoords } : {
    startLocation: string;
    endLocation: string;
    startCoords: string;
    endCoords: string;
  } = useLocalSearchParams();

  const [fullTrips, setFullTrips] = useState<FullTripV2[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<FullTripV2[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: "Verified by moderators",
    transportModes: ["Train", "Bus", "Jeep", "UV", "Tricycle"],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tripDetails = {
    startCoords: startCoords ? JSON.parse(startCoords) : [0, 0],
    endCoords: endCoords ? JSON.parse(endCoords) : [0, 0],
    startLocation,
    endLocation,
  } as TripDetails;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchTripData(tripDetails, 1500);
        if (data.error) {
          throw new Error(data.error.message);
        }

        const nearbyTrips: FullTripV2[] = data;

        const fullTrips: FullTripV2[] = nearbyTrips.map((trip) => {
          const startSegment = generateWalkingSegment(startLocation, tripDetails.startCoords, trip.startLocation, trip.startCoords);
          const endSegment = generateWalkingSegment(trip.endLocation, trip.endCoords, endLocation, tripDetails.endCoords);
          return {
            ...trip,
            segments: [startSegment, ...trip.segments, endSegment].filter((segment) => segment),
          };
        });

        setFullTrips(fullTrips);
      } catch (err: any) {
        setError(err.message || "Something went wrong while fetching trips.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log("FULL TRIPS: ", fullTrips);
  console.log("SEGMENTS: ", fullTrips.map(trip => trip.segments));

  useEffect(() => {
    const filteredTrips: FullTripV2[] = fullTrips.filter((trip) => {
      return trip.segments.every((segment) => {
        const mode = segment.segment_mode || segment.segmentMode;
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
        filteredTrips.sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)));
        break;
      case "Duration":
        filteredTrips.sort((a, b) => {
          const durationA = a.segments?.reduce((acc, seg) => acc + (seg.duration || 0), 0) ?? Infinity;
          const durationB = b.segments?.reduce((acc, seg) => acc + (seg.duration || 0), 0) ?? Infinity;
          return durationA - durationB;
        });
        break;
    }
    setFilteredTrips(filteredTrips);
  }, [fullTrips, filters]);

  console.log("FILTERED TRIPS: ", filteredTrips);

  const handlePress = (trip: FullTripV2) => {
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
              <TripPreview trip={trip} />
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
