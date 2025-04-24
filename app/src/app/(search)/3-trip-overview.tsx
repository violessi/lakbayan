import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, Alert, BackHandler, SafeAreaView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import LineSource from "@components/map/LineSource";
import CircleSource from "@components/map/CircleSource";
import SymbolMarker from "@components/map/SymbolMarker";
import SymbolSource from "@components/map/SymbolSource";
import TripSummary from "@components/search/TripSummary";

import { useMapView } from "@hooks/use-map-view";
import { useTripSearch } from "@contexts/TripSearchContext";
import { useSession } from "@contexts/SessionContext";
import { useLiveUpdates } from "@hooks/use-live-updates";
import { useTransitJournal } from "@contexts/TransitJournalContext";
import { insertSegments, insertTransitJournal, updateProfile } from "@services/trip-service";
import { updateSearchLog, fetchSearchLogId } from "@services/logs-service";

export default function TripOverview() {
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [doneLiveStatus, setDoneLiveStatus] = useState(false);

  const router = useRouter();
  const { tripData, from } = useLocalSearchParams();

  const { user } = useSession();
  const { cameraRef } = useMapView();
  const { trip: contextTrip } = useTripSearch();
  const { transitJournalId } = useTransitJournal();
  const { symbolRef, updateLiveStatus } = useLiveUpdates("line", 5);

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
    setHasError(false);
    try {
      // if trip has pre/post segments, insert them first to segments table
      const { preSegment, postSegment } = trip;
      const preSegmentId = preSegment ? (await insertSegments([preSegment]))[0] : null;
      const postSegmentId = postSegment ? (await insertSegments([postSegment]))[0] : null;

      // insert transit journal for the trip
      const transitJournalId = await insertTransitJournal({
        userId: user.id,
        tripId: trip.id,
        preSegmentId,
        postSegmentId,
      });

      // bind transit journal to user
      await updateProfile({ id: user.id, transitJournalId });

      // TODO: MOVE TO CONTEXT
      const id = await fetchSearchLogId({ userId: user.id });
      if (!id) throw new Error("Search log not found");

      const logsPayload: Partial<SearchLog> = {
        id: id,
        didTransitJournal: true,
      };
      await updateSearchLog(logsPayload);
      
    } catch (error) {
      Alert.alert("Error starting trip, please try again");
      setHasError(true);
    }
  }

  useEffect(() => {
    if (!!transitJournalId && !hasError) {
      router.replace("/(journal)/transit-journal");
    }
  }, [transitJournalId]);

  useEffect(() => {
    if (!trip.segments) return;
    updateLiveStatus(trip.segments.flatMap(({ waypoints }) => waypoints));
    setDoneLiveStatus(true);
  }, [trip.segments]);

  // navigation
  const prevCallback = () => {
    if (loadingTrip || !doneLiveStatus) return;
    if (from === "submitted-trips") {
      router.replace("/(account)/submitted-trips");
      return;
    }
    if (from === "recent-trips") {
      router.replace("/(tabs)");
      return;
    }
    if (from === "bookmarked-trips") {
      router.replace("/(account)/bookmarked-trips");
      return;
    }
    router.replace("/(search)/2-trip-suggestions");
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (loadingTrip || !doneLiveStatus) return true;
        router.replace("/(search)/2-trip-suggestions");
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [loadingTrip]),
  );
  
  if(!doneLiveStatus) {
    return (
      <View className="flex-1 justify-center items-center bg-black/50 z-50">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white">Loading trip...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <Header title="Trip Overview" prevCallback={prevCallback} />

      <MapShell cameraRef={cameraRef} fitBounds={[trip.startCoords, trip.endCoords]}>
        <SymbolMarker id="start" label="Start" coordinates={trip.startCoords} />
        <SymbolSource id={"live-update"} ref={symbolRef} />
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
