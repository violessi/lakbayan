import React, { useRef, Fragment } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, SafeAreaView, Alert } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { useSession } from "@contexts/SessionContext";
import Header from "@components/ui/Header";
import CircleMarker from "@components/map/CircleMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import SecondaryButton from "@components/ui/SecondaryButton";
import TripSummary from "@components/search/TripSummary";
import DirectionsLine from "@components/ui/DirectionsLine";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
import { updateModerationStatus } from "@services/moderation-service";

export default function ModerateTripReview() {
  const cameraRef = useRef<Camera>(null);
  const router = useRouter();
  const { user } = useSession();
  const { tripData } = useLocalSearchParams();

  const trip = typeof tripData === "string" ? JSON.parse(tripData) : null;
  if (!trip) throw new Error("Trip not found");

  const handleMapLoaded = () => {
    if (cameraRef.current) {
      cameraRef.current.fitBounds(trip.startCoords, trip.endCoords, [150, 150, 250, 150]);
    }
  };

  function handleCommentPress(tripId: string) {
    router.push({
      pathname: "/(social)/comments-list",
      params: { tripId, is_gps_verified: "false" },
    });
  }

  async function handleModeration(status: string) {
    Alert.alert(
      `Confirm ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Are you sure you want to mark this trip as ${status}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              await updateModerationStatus(user?.id || "", trip.id, status);
              Alert.alert("Success", `Trip has been marked as ${status}.`, [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert("Error", "Failed to update moderation status. Please try again.");
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Trip Overview" />

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onDidFinishLoadingMap={handleMapLoaded}
        testID="map-view"
      >
        <Camera ref={cameraRef} animationMode="easeTo" zoomLevel={10} />

        {/* Overall Start and End Markers */}
        <CircleMarker
          id="start"
          coordinates={trip.startCoords}
          label={trip.startLocation}
          color="green"
          radius={8}
          testID="start-marker"
        />
        <CircleMarker
          id="end"
          coordinates={trip.endCoords}
          label={trip.endLocation}
          color="red"
          radius={8}
          testID="end-marker"
        />

        {trip.segments.map((segment: Segment, index: number) => (
          <Fragment key={`segment-markers-${index}`}>
            <CircleMarker
              id={`start-seg-${index}`}
              coordinates={segment.startCoords}
              label={segment.startLocation}
              color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
              radius={6}
            />
            <CircleMarker
              id={`end-seg-${index}`}
              coordinates={segment.endCoords}
              label={segment.endLocation}
              color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
              radius={6}
            />
          </Fragment>
        ))}

        {trip.segments.map((segment: Segment, index: number) => (
          <DirectionsLine
            key={`directions-${index}`}
            coordinates={segment.waypoints}
            color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
          />
        ))}
      </MapView>

      {user && (
        <TripSummary
          trip={trip}
          segments={trip.segments}
          currentUserId={user.id}
          handleCommentPress={handleCommentPress}
        />
      )}

      {user && (
        <View className="flex-row justify-center gap-5 p-4">
          <SecondaryButton label="Dismiss" onPress={() => handleModeration("dismissed")} />
          <PrimaryButton label="Verify" onPress={() => handleModeration("verified")} />
        </View>
      )}
    </SafeAreaView>
  );
}
