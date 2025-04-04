import { useRouter } from "expo-router";
import { SafeAreaView, Text, Button } from "react-native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import LineSource from "@components/map/LineSource";
import CircleSource from "@components/map/CircleSource";
import JournalFeedback from "@components/journal/JournalFeedback";

import { useMapView } from "@hooks/use-map-view";
import { useSession } from "@contexts/SessionContext";
import { useTransitJournal } from "@contexts/TransitJournal";

export default function JournalReview() {
  const router = useRouter();
  const { user } = useSession();
  const { cameraRef } = useMapView();
  const { trip, segments, transitJournal } = useTransitJournal();

  function handleCommentPress(tripId: string) {
    router.push({
      pathname: "/(social)/comments-list",
      params: { tripId, is_gps_verified: "true" },
    });
  }

  if (!trip || !segments || !user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>No active trip found.</Text>
        <Button title="Go back" onPress={() => router.push("/(tabs)")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Journal Review" />

      <MapShell fitBounds={[trip.startCoords, trip.endCoords]} cameraRef={cameraRef}>
        <CircleSource id="start" data={[trip.startCoords]} radius={6} />
        <CircleSource id="transfer-points" data={segments} radius={6} />
        <LineSource id="line-source" data={segments} lineWidth={3} />
      </MapShell>

      <JournalFeedback
        trip={trip}
        segments={segments}
        currentUserId={user.id}
        onCommentPress={handleCommentPress}
        isGpsVerified={true}
        transitJournal={transitJournal}
      />
    </SafeAreaView>
  );
}
