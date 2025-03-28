import React, { useEffect, useRef, useMemo, Fragment } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, SafeAreaView, Text, ActivityIndicator } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { useSession } from "@contexts/SessionContext";
import { useFetchSegmentDirections } from "@hooks/use-fetch-segment-directions";

import Header from "@components/ui/Header";
import DirectionsLine from "@components/ui/DirectionsLine";
import LocationMarker from "@components/ui/LocationMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import CircleMarker from "@components/map/CircleMarker";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

import TripSummary from "@components/search/TripSummary";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TripOverview() {
  const router = useRouter();
  const { user } = useSession();
  const cameraRef = useRef<Camera>(null);

  const { params } = useLocalSearchParams();
  const trip = JSON.parse(params as string) as FullTrip;
  const segments = trip.segments;
  console.log("Trip Overview", trip);
  console.log("Trip Segments", segments);

  const handleMapLoaded = () => {
    if (cameraRef.current) {
      cameraRef.current.fitBounds(trip.startCoords, trip.endCoords, [150, 150, 250, 150]);
    }
  };

  function handleCommentPress(tripId: string) {
    router.push({
      pathname: "/(social)/comments-list",
      params: { tripId },
    });
  }

  function handleStartPress() {
    router.push({
      pathname: "/(journal)/transit-journal",
      params: { trip: JSON.stringify(trip), segments: JSON.stringify(trip.segments) },
    });
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

        {segments.map((segment, index) => (
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
        {segments.map((segment, index) => (
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
          startLocation={trip.startLocation}
          endLocation={trip.endLocation}
          trip={trip}
          segments={trip.segments}
          currentUserId={user.id}
          onCommentPress={handleCommentPress}
        />
      )}
    </SafeAreaView>
  );
}
