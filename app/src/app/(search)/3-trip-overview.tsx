import { useRouter } from "expo-router";
import React, { useRef, Fragment } from "react";
import { Alert, View, SafeAreaView } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

import Header from "@components/ui/Header";
import CircleMarker from "@components/map/CircleMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import TripSummary from "@components/search/TripSummary";
import DirectionsLine from "@components/ui/DirectionsLine";

import { useTripSearch } from "@contexts/TripSearch";
import { useSession } from "@contexts/SessionContext";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";
import { insertSegments, insertTransitJournal, updateProfile } from "@services/trip-service-v2";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TripOverview() {
  const router = useRouter();
  const { user } = useSession();
  const cameraRef = useRef<Camera>(null);

  const { trip } = useTripSearch();
  if (!trip) throw new Error("Trip not found in context");

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

  async function handleStartPress() {
    try {
      // if trip has pre/post segments, insert them first to segments table
      const { preSegment, postSegment } = trip!;
      const preSegmentId = preSegment ? (await insertSegments([preSegment]))[0] : null;
      const postSegmentId = postSegment ? (await insertSegments([postSegment]))[0] : null;

      // insert transit journal for the trip
      const transitJournalId = await insertTransitJournal({
        userId: user!.id,
        tripId: trip!.id,
        preSegmentId,
        postSegmentId,
      });

      // bind transit journal to user
      await updateProfile({ id: user!.id, transitJournalId });
      Alert.alert("Trip started successfully");
      // router.push("/(journal)/transit-journal");
    } catch (error) {
      Alert.alert("Error starting trip");
      console.error(error);
    }
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Trip Overview" />

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onDidFinishLoadingMap={handleMapLoaded}
      >
        <Camera ref={cameraRef} animationMode="easeTo" zoomLevel={10} />

        {/* Overall Start and End Markers */}
        <CircleMarker
          id="start"
          coordinates={trip.startCoords}
          label={trip.startLocation}
          color="green"
          radius={8}
        />
        <CircleMarker
          id="end"
          coordinates={trip.endCoords}
          label={trip.endLocation}
          color="red"
          radius={8}
        />

        {trip.segments.map((segment, index) => (
          <Fragment key={`segment-markers-${index}`}>
            <CircleMarker
              id="start-seg"
              coordinates={segment.startCoords}
              label={segment.startLocation}
              color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
              radius={6}
            />
            <CircleMarker
              id="end-seg"
              coordinates={segment.endCoords}
              label={segment.endLocation}
              color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
              radius={6}
            />
          </Fragment>
        ))}
        {trip.segments.map((segment, index) => (
          <DirectionsLine
            key={index}
            coordinates={segment.waypoints}
            color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
          />
        ))}
      </MapView>

      <View className="px-10  z-10">
        <PrimaryButton label="Start" onPress={handleStartPress} />
      </View>

      {user && (
        <TripSummary
          trip={trip}
          segments={trip.segments}
          currentUserId={user.id}
          onCommentPress={handleCommentPress}
        />
      )}
    </SafeAreaView>
  );
}
