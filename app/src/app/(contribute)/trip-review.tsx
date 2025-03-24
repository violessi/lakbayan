import React, { useRef } from "react";
import { router } from "expo-router";
import { useTrip } from "@contexts/TripContext";
import { useSession } from "@contexts/SessionContext";
import { SafeAreaView, View, Alert } from "react-native";
import uuid from "react-native-uuid";

import Header from "@components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import TripSummary from "@components/contribute/TripSummary";
import DirectionsLine from "@components/ui/DirectionsLine";
import LocationMarker from "@components/ui/LocationMarker";
import TripTitle from "@components/contribute/TripTitle";

import { TRANSPORTATION_COLORS } from "@constants/transportation-color";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { insertTripAndRelated } from "@services/trip-service";
import { addTripToModeration } from "@services/moderation-service";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TripReview() {
  const cameraRef = useRef<Camera>(null);

  const { userId } = useSession();
  const { trip, segments = [] } = useTrip();

  const segmentCoordinates = segments?.map((segment) => segment.directions.routes[0].geometry.coordinates) || [];
  const startCoordinates = trip.start_coords;
  const endCoordinates = trip.end_coords;
  const startLocation = trip.start_location;
  const endLocation = trip.end_location;

  const handleMapLoaded = () => {
    if (startCoordinates && endCoordinates && cameraRef.current) {
      cameraRef.current.fitBounds(startCoordinates, endCoordinates, [150, 150, 250, 150]);
    }
  };

  const handleNavigateToRouteInput = () => {
    router.push("/(contribute)/route-select-info");
  };

  // Check if there is at least one segment and if the trip's end_location
  // matches the last segment's end_location.
  const isSameEndLocation = segments.length > 0 && trip.end_location === segments[segments.length - 1].end_location;

  const handleSubmitTrip = async () => {
    // Generate a new trip id.
    const tripId = uuid.v4();

    // Build the new trip object.
    const newTrip: Trip = {
      ...trip,
      id: tripId,
      contributor_id: userId || "",
      name: `${trip.start_location} to ${trip.end_location}`,
      duration: segments.reduce((acc, segment) => acc + segment.duration, 0),
      cost: segments.reduce((acc, segment) => acc + segment.cost, 0),
    };

    // Build the joint segments array as an array of objects
    // that conform to the SegmentsToTrips interface.
    const jointSegments: SegmentsToTrips[] = segments.map((segment, index) => ({
      trip_id: tripId,
      segment_id: segment.id,
      segment_order: index,
    }));

    try {
      // Call the new helper function that performs sequential inserts.
      const result = await insertTripAndRelated(newTrip, segments, jointSegments);
      // console.log("Trip and related inserted:", result);

      await addTripToModeration(tripId);

      // Alert the user and navigate to the desired page.
      Alert.alert(
        "Trip Submitted",
        "Your custom route has been submitted. Do you want to transit journal it for GPS verification?",
      );
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error inserting trip and related:", error);
      Alert.alert("Error", "There was an error submitting your trip. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Trip Review" />

      <View className="flex justify-center items-center">
        <TripTitle startLocation={trip.start_location} endLocation={trip.end_location} />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onDidFinishLoadingMap={handleMapLoaded}
      >
        <Camera ref={cameraRef} centerCoordinate={[121.05, 14.63]} animationMode="easeTo" zoomLevel={10} />

        <LocationMarker coordinates={startCoordinates} label={startLocation} color="red" radius={8} />
        <LocationMarker coordinates={endCoordinates} label={endLocation} color="red" radius={8} />

        {segmentCoordinates.map((coordinates, index) => (
          <DirectionsLine
            key={index}
            coordinates={coordinates}
            color={TRANSPORTATION_COLORS[index % TRANSPORTATION_COLORS.length]}
          />
        ))}
      </MapView>

      <View className="px-10 py-20 z-10">
        <PrimaryButton
          label={isSameEndLocation ? "Submit" : "Add Transfers"}
          onPress={isSameEndLocation ? handleSubmitTrip : handleNavigateToRouteInput}
        />
      </View>

      <TripSummary startLocation={trip.start_location} endLocation={trip.end_location} segments={segments} />
    </SafeAreaView>
  );
}
