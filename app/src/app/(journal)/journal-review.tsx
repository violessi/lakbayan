import React, { useEffect, useRef, useMemo, Fragment } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView, Text, ActivityIndicator } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { useSession } from "@contexts/SessionContext";
import { useFetchSegmentDirections } from "@hooks/use-fetch-segment-directions";

import Header from "@components/ui/Header";
import DirectionsLine from "@components/ui/DirectionsLine";
import LocationMarker from "@components/ui/LocationMarker";
import JournalFeedback from "@components/journal/JournalFeedback";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function JournalReview() {
  const cameraRef = useRef<Camera>(null);
  const router = useRouter();

  const { user } = useSession();

  const { trip, segments } = useLocalSearchParams();
  const tripData: Trip = useMemo(() => {
    const tripString = Array.isArray(trip) ? trip[0] : trip;
    return tripString ? JSON.parse(tripString) : null;
  }, [trip]);
  const segmentData: Segment[] = useMemo(() => {
    const segmentString = Array.isArray(segments) ? segments[0] : segments;
    return segmentString ? JSON.parse(segmentString) : [];
  }, [segments]);

  const startCoordinates = tripData.start_coords || null;
  const endCoordinates = tripData.end_coords || null;
  const startLocation = tripData.start_location || "Start";
  const endLocation = tripData.end_location || "End";

  const { segmentRoutes, loading } = useFetchSegmentDirections(segmentData);

  // Camera
  useEffect(() => {
    if (startCoordinates && endCoordinates && cameraRef.current) {
      cameraRef.current.fitBounds(startCoordinates, endCoordinates, [150, 150, 250, 150]);
    }
  }, [segmentRoutes, startCoordinates, endCoordinates]);

  function handleCommentPress(tripId: string) {
    router.push({
      pathname: "/(search)/comments-list",
      params: { tripId },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <Header title="Journal Review" />

      <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12" projection="mercator">
        <Camera ref={cameraRef} centerCoordinate={endCoordinates} animationMode="easeTo" zoomLevel={10} />

        <LocationMarker coordinates={startCoordinates} label={startLocation} color="red" radius={8} />
        <LocationMarker coordinates={endCoordinates} label={endLocation} color="red" radius={8} />

        {segmentData.map((segment, index) => (
          <Fragment key={`segment-markers-${index}`}>
            <LocationMarker
              coordinates={segment.start_coords}
              label={segment.start_location}
              color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
              radius={6}
            />
            <LocationMarker
              coordinates={segment.end_coords}
              label={segment.end_location}
              color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
              radius={6}
            />
          </Fragment>
        ))}

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" style={{ position: "absolute", top: "50%", left: "50%" }} />
        ) : segmentRoutes.length > 0 ? (
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
          startLocation={startLocation}
          endLocation={endLocation}
          trip={tripData}
          segments={segmentData}
          currentUserId={user.id}
          onCommentPress={handleCommentPress}
        />
      )}
    </SafeAreaView>
  );
}
