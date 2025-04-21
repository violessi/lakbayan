import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, Alert, BackHandler, SafeAreaView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import LineSource from "@components/map/LineSource";
import CircleSource from "@components/map/CircleSource";
import SymbolMarker from "@components/map/SymbolMarker";
import TripSummary from "@components/search/TripSummary";

import { useMapView } from "@hooks/use-map-view";
import { useTripSearch } from "@contexts/TripSearchContext";
import { useSession } from "@contexts/SessionContext";
import { useTransitJournal } from "@contexts/TransitJournalContext";
import { insertSegments, insertTransitJournal, updateProfile } from "@services/trip-service";

export default function TripOverview() {
  const [loadingTrip, setLoadingTrip] = useState(false);

  const router = useRouter();
  const { tripData } = useLocalSearchParams();

  const { user } = useSession();
  const { cameraRef } = useMapView();
  const { trip: contextTrip } = useTripSearch();
  const { transitJournalId } = useTransitJournal();

  // NOTE: some pages redirect to this page using searchParams
  const trip =
    contextTrip ?? ((typeof tripData === "string" ? JSON.parse(tripData) : null) as TripSearch);
  if (!trip) throw new Error("Trip not found");

  function handleCommentPress(tripId: string) {
    router.push({
      pathname: "/(social)/comments-list",
      params: { tripId, is_gps_verified: "false" },
    });
  }

  async function handleStartPress() {
    if (!user) throw new Error("User not found");
    if (!!transitJournalId) {
      Alert.alert(
        "Existing trip in progress",
        "Please finish your current trip before starting a new one.",
      );
      return;
    }

    // loading state
    setLoadingTrip(true);
    try {
      // if trip has pre/post segments, insert them first to segments table
      const { preSegment, postSegment } = trip;
      const preSegmentId = preSegment ? (await insertSegments([preSegment]))[0] : null;
      console.log("Done adding preSegmentId", preSegmentId);
      const postSegmentId = postSegment ? (await insertSegments([postSegment]))[0] : null;
      console.log("Done adding postSegmentId", postSegmentId);

      // insert transit journal for the trip
      const transitJournalId = await insertTransitJournal({
        userId: user.id,
        tripId: trip.id,
        preSegmentId,
        postSegmentId,
      });
      console.log("Done adding transitJournalId", transitJournalId);

      // bind transit journal to user
      await updateProfile({ id: user.id, transitJournalId });
      console.log("Done adding transitJournalId to user", transitJournalId);
    } catch (error) {
      Alert.alert("Error starting trip, please try again");
    }
  }

  useEffect(() => {
    if (!!transitJournalId) {
      router.replace("/(journal)/transit-journal");
    }
  }, [transitJournalId]);

  // navigation
  const prevCallback = () => {
    if (loadingTrip) return;
    router.replace("/(search)/2-trip-suggestions");
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (loadingTrip) return true;
        router.replace("/(search)/2-trip-suggestions");
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [loadingTrip]),
  );

  return (
    <SafeAreaView className="flex-1">
      <Header title="Trip Overview" prevCallback={prevCallback} />

      <MapShell cameraRef={cameraRef} fitBounds={[trip.startCoords, trip.endCoords]}>
        <SymbolMarker id="start" label="Start" coordinates={trip.startCoords} />
        <CircleSource id="transfers" data={trip.segments} />
        <LineSource id="segments" data={trip.segments} lineWidth={3} />
      </MapShell>

      <TripSummary
        trip={trip}
        segments={trip.segments}
        currentUserId={user?.id}
        handleCommentPress={handleCommentPress}
        handleStartPress={handleStartPress}
        loadingTrip={loadingTrip}
      />

      {loadingTrip && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/50 z-50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white text-lg">Please wait while we load your trip...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
