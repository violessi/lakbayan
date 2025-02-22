import React, { useEffect, useRef, useState, useMemo, Fragment } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, SafeAreaView, Text, ActivityIndicator } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import Header from "@components/ui/Header";
import DirectionsLine from "@components/ui/DirectionsLine";
import LocationMarker from "@components/ui/LocationMarker";
import PrimaryButton from "@components/ui/PrimaryButton";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

import TripSummary from "@components/search/TripSummary";

import { getDirections } from "@services/mapbox-service";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TripOverview() {
  const cameraRef = useRef<Camera>(null);
  const { trip, segments } = useLocalSearchParams();

  const tripData = useMemo(() => (trip ? JSON.parse(trip) : null), [trip]);
  const segmentData = useMemo(() => (segments ? JSON.parse(segments) : []), [segments]);

  const startCoordinates = tripData?.start_coords || null;
  const endCoordinates = tripData?.end_coords || null;
  const startLocation = tripData?.start_location || "Start";
  const endLocation = tripData?.end_location || "End";

  const [segmentRoutes, setSegmentRoutes] = useState<Coordinates[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllDirections() {
      setLoading(true);
      try {
        const segmentPromises = segmentData.map(async (segment, index) => {
          const { start_coords, end_coords, segment_mode } = segment;
          const waypoints = Array.isArray(segment.waypoints) ? segment.waypoints : [];
          console.log(`Fetching route for segment ${index + 1}:`, { start_coords, waypoints, end_coords });

          const res = await getDirections(start_coords, waypoints, end_coords, segment_mode);
          return res?.routes?.[0]?.geometry?.coordinates || [];
        });

        const segmentRoutes = await Promise.all(segmentPromises);
        setSegmentRoutes(segmentRoutes);
      } catch (error) {
        console.error("Error fetching directions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllDirections();
  }, [segmentData]);

  useEffect(() => {
    if (startCoordinates && endCoordinates && cameraRef.current) {
      cameraRef.current.fitBounds(startCoordinates, endCoordinates, [150, 150, 250, 150]);
    }
  }, [segmentRoutes, startCoordinates, endCoordinates]);

  return (
    <SafeAreaView className="flex-1">
      <Header title="Trip Overview" />

      <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12" projection="mercator">
        <Camera ref={cameraRef} centerCoordinate={startCoordinates} animationMode="easeTo" zoomLevel={10} />

        {/* Overall Start and End Markers */}
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

      <View className="px-10  z-10">
        <PrimaryButton label="Start" />
      </View>
      <TripSummary startLocation={startLocation} endLocation={endLocation} trip={tripData} segments={segmentData} />
    </SafeAreaView>
  );
}
