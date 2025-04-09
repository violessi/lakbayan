import { useEffect } from "react";
import { Alert, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import LineSource from "@components/map/LineSource";
import CircleSource from "@components/map/CircleSource";
import SymbolMarker from "@components/map/SymbolMarker";
import TripSummary from "@components/search/TripSummary";

import { useMapView } from "@hooks/use-map-view";
import { useTripSearch } from "@contexts/TripSearch";
import { useSession } from "@contexts/SessionContext";
import { useTransitJournal } from "@contexts/TransitJournal";
import { insertSegments, insertTransitJournal, updateProfile } from "@services/trip-service";

export default function TripOverview() {
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
    } catch (error) {
      Alert.alert("Error starting trip, please try again");
    }
  }

  useEffect(() => {
    if (!!transitJournalId) {
      router.replace("/(journal)/transit-journal");
    }
  }, [transitJournalId]);

  return (
    <SafeAreaView className="flex-1">
      <Header title="Trip Overview" />

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
      />
    </SafeAreaView>
  );
}
