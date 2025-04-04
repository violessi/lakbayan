import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { SafeAreaView, Text, Button } from "react-native";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

import Header from "@components/ui/Header";
import LineSource from "@components/map/LineSource";
import CircleSource from "@components/map/CircleSource";
import JournalFeedback from "@components/journal/JournalFeedback";

import { useSession } from "@contexts/SessionContext";
import { useTransitJournal } from "@contexts/TransitJournal";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function JournalReview() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);

  const { user } = useSession();
  if (!user) throw new Error("User is not logged in");

  const { trip, segments, transitJournal, hasActiveTransitJournal } = useTransitJournal();

  useEffect(() => {
    if (!trip) return;
    cameraRef.current?.fitBounds(trip.startCoords, trip.endCoords, [50, 50, 50, 50]);
  }, [trip]);

  function handleCommentPress(tripId: string) {
    router.push({
      pathname: "/(social)/comments-list",
      params: { tripId, is_gps_verified: "true" },
    });
  }

  if (!hasActiveTransitJournal || !trip || !segments) {
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

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={trip.startCoords}
          animationMode="easeTo"
          zoomLevel={10}
        />
        <CircleSource id="start" data={[trip.startCoords]} radius={6} />
        <CircleSource id="transfer-points" data={segments} radius={6} />
        <LineSource id="line-source" data={segments} lineWidth={3} />
      </MapView>

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
