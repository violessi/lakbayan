import { useRouter } from "expo-router";
import { SafeAreaView, Text } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import React, { useEffect, useRef, Fragment } from "react";

import Header from "@components/ui/Header";
import DirectionsLine from "@components/ui/DirectionsLine";
import LocationMarker from "@components/ui/LocationMarker";
import JournalFeedback from "@components/journal/JournalFeedback";

import { useSession } from "@contexts/SessionContext";
import { useTransitJournal } from "@contexts/TransitJournal";
import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function JournalReview() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);

  const { user } = useSession();
  const { trip, segments, transitJournal } = useTransitJournal();

  const segmentRoutes = segments?.map((segment) => segment.waypoints) ?? [];

  // Camera
  useEffect(() => {
    if (!trip) return;
    if (trip.startCoords && trip.endCoords && cameraRef.current) {
      cameraRef.current.fitBounds(trip.startCoords, trip.endCoords, [150, 150, 250, 150]);
    }
  }, [segmentRoutes, trip]);

  function handleCommentPress(tripId: string) {
    router.push({
      pathname: "/(social)/comments-list",
      params: { tripId, is_gps_verified: "true" },
    });
  }

  if (!trip || !segments) {
    return (
      <SafeAreaView className="flex-1">
        <Header title="Journal Review" />
        <Text>Loading...</Text>
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

        <LocationMarker
          id="start"
          coordinates={trip.startCoords}
          label={trip.startLocation}
          color="red"
          radius={8}
        />
        <LocationMarker
          id="end"
          coordinates={trip.endCoords}
          label={trip.endLocation}
          color="red"
          radius={8}
        />

        {segments.map((segment, index) => (
          <Fragment key={`segment-markers-${index}`}>
            <LocationMarker
              id={`start-${index}`}
              coordinates={segment.startCoords}
              label={segment.startLocation}
              color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
              radius={6}
            />
            <LocationMarker
              id={`end-${index}`}
              coordinates={segment.endCoords}
              label={segment.endLocation}
              color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
              radius={6}
            />
          </Fragment>
        ))}

        {segmentRoutes.length > 0 ? (
          segmentRoutes.map((coordinates, index) => (
            <DirectionsLine
              key={index}
              coordinates={coordinates}
              color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
            />
          ))
        ) : (
          <Text style={{ position: "absolute", top: "50%", left: "50%" }}>No route available</Text>
        )}
      </MapView>

      {user && (
        <JournalFeedback
          startLocation={trip.startLocation}
          endLocation={trip.endLocation}
          trip={trip}
          segments={segments}
          currentUserId={user.id}
          onCommentPress={handleCommentPress}
          isGpsVerified={true}
          transitJournal={transitJournal}
        />
      )}
    </SafeAreaView>
  );
}
