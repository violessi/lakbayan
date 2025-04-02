import { useRouter } from "expo-router";
import { SafeAreaView, Text, Button } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import React, { useEffect, useRef } from "react";

import Header from "@components/ui/Header";
import DirectionsLine from "@components/ui/DirectionsLine";
import CircleMarker from "@components/map/CircleMarker";
import JournalFeedback from "@components/journal/JournalFeedback";

import { useSession } from "@contexts/SessionContext";
import { useTransitJournal } from "@contexts/TransitJournal";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function JournalReview() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);

  const { user } = useSession();
  if (!user) throw new Error("User is not logged in");

  const { trip, segments, transitJournal, hasActiveTransitJournal } = useTransitJournal();
  const segmentRoutes = segments?.map((segment) => segment.waypoints) ?? [];

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

        <CircleMarker
          id="start"
          coordinates={trip.startCoords}
          label={trip.startLocation}
          color={TRANSPORTATION_COLORS[0]}
        />

        {segments.map((segment, index) => (
          <CircleMarker
            id={`end-${index}`}
            coordinates={segment.endCoords}
            label={segment.endLocation}
            color={TRANSPORTATION_COLORS[index]}
          />
        ))}

        {segmentRoutes.map((coordinates, index) => (
          <DirectionsLine
            key={index}
            coordinates={coordinates}
            color={TRANSPORTATION_COLORS[index]}
          />
        ))}
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
