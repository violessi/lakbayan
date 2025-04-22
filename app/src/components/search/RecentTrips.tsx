import React, { useEffect, useState } from "react";
import { Text, Pressable, Image, View } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

import { fetchLatestTransitJournals, fetchTrip } from "@services/trip-service";

import { useSession } from "@contexts/SessionContext";

import pinFilled from "@assets/pin-purple.png";
import pinHollow from "@assets/pin-hollow.png";
import next from "@assets/next-filled.png";

export default function RecentTrips() {
  const { user } = useSession();

  const snapPoints = ["20%"];
  const router = useRouter();

  const [recentJournals, setRecentJournals] = useState<TransitJournal[]>([]);
  const [tripData, setTripData] = useState<Record<string, FullTrip>>({});

  useEffect(() => {
    async function loadRecentJournals() {
      try {
        if (!user) return;
        const journals = await fetchLatestTransitJournals(user.id);
        const trips: Record<string, FullTrip> = {};
        for (const journal of journals) {
          try {
            const trip = await fetchTrip(journal.tripId);
            trips[journal.id] = trip;
          } catch (e) {
            console.error("Error fetching trip for journal", journal.id);
          }
        }
        setRecentJournals(journals);
        setTripData(trips);
        console.log(journals);
      } catch (error) {
        console.error(error);
      }
    }

    loadRecentJournals();
  }, []);

  function handleTripPress(trip: FullTrip) {
    const tripSearch: TripSearch = {
      ...trip,
      segments: trip.segments,
      preSegment: null,
      postSegment: null,
    };

    router.push({
      pathname: "/(search)/3-trip-overview",
      params: { tripData: JSON.stringify(tripSearch) },
    });
  }

  return (
    <BottomSheet snapPoints={snapPoints} index={1}>
      <BottomSheetView className="flex flex-col px-5 gap-2">
        <Text className="text-xl font-bold">Recent Trips</Text>
        {recentJournals.map((journal) => {
          const trip = tripData[journal.id];
          return (
            <Pressable
              key={journal.id}
              onPress={() => {
                if (journal.status === "ongoing") {
                  router.push("/(journal)/transit-journal");
                } else if (trip) {
                  handleTripPress(trip);
                }
              }}
              className="bg-white px-2 py-4 border-b border-gray-200"
            >
              <View className="flex flex-row justify-between items-center">
                <View>
                  <View className="flex flex-row items-center gap-4 mb-2">
                    <Image source={pinHollow} className="w-5 h-5" />
                    <Text className="text-gray-600 text-md">
                      {trip?.startLocation?.split(",")[0] || "Unknown Origin"}
                    </Text>
                  </View>
                  <View className="flex flex-row items-center gap-4 mb-1">
                    <Image source={pinFilled} className="w-5 h-5" />
                    <Text className="text-gray-600 text-md">
                      {trip?.endLocation?.split(",")[0] || "Unknown Origin"}
                    </Text>
                  </View>
                  {journal.status === "ongoing" && (
                    <Text className="text-gray-500 text-sm mb-1">Ongoing</Text>
                  )}
                </View>
                <Image source={next} className="w-7 h-7 mr-1" />
              </View>
            </Pressable>
          );
        })}
      </BottomSheetView>
    </BottomSheet>
  );
}
