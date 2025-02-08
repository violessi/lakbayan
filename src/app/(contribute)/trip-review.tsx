import React, { useRef } from "react";
import { router } from "expo-router";
import { useTrip } from "@contexts/TripContext";
import { SafeAreaView, View, Alert } from "react-native";
import uuid from "react-native-uuid";

import { SafeAreaView, View, Alert, Text, Button } from "react-native";
import Header from "@components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import TripSummary from "@components/contribute/TripSummary";
import DirectionsLine from "@components/ui/DirectionsLine";
import TripTitle from "@components/contribute/TripTitle";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { insertTripSegment } from "@services/trip-service";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TripReview() {
  const cameraRef = useRef<Camera>(null);
  const { trip } = useTrip();

  const routeCoordinates = trip.routes?.map((route) => route.directions.routes[0].geometry.coordinates) || [];
  const startCoordinates = trip.startCoordinates;
  const endCoordinates = trip.endCoordinates;
  const { trip, segments = [] } = useTrip();

  const segmentCoordinates = segments?.map((segment) => segment.directions.routes[0].geometry.coordinates) || [];
  const startCoordinates = trip.start_coords;
  const endCoordinates = trip.end_coords;
  const startLocation = trip.start_location;
  const endLocation = trip.end_location;

  {
    /* FIXME Move colors to constant */
  }
  // Assign colors to each route line based on index
  /* FIXME: Move colors to constant */
  const routeColors = ["#FF5733", "#3357FF", "#F3FF33", "#FF33A6"];

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
  const isSameEndLocation =
    trip.routes.length > 0 && trip.endLocation === trip.routes[trip.routes.length - 1].endLocation;

  const handleSubmitTrip = () => {
    trip.routes.forEach((route) => {
      insertTripSegment(route);
    });
    Alert.alert(
      "Trip Submitted",
      "Your custom route has been submitted. You may transit journal it for GPS verification?",
    );
    router.replace("/(tabs)");
  };
    segments.length > 0 &&
    trip.end_location === segments[segments.length - 1].end_location;


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Trip Review" />

      <View className="flex justify-center items-center">
        <TripTitle startLocation={trip.startLocation} endLocation={trip.endLocation} />
        <TripTitle startLocation={trip.start_location} endLocation={trip.end_location} />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onDidFinishLoadingMap={handleMapLoaded}
      >
        <Camera ref={cameraRef} centerCoordinate={[121.05, 14.63]} animationMode="easeTo" zoomLevel={10} />

        {routeCoordinates.map((coordinates, index) => (
          <DirectionsLine key={index} coordinates={coordinates} color={routeColors[index % routeColors.length]} />
        {segmentCoordinates.map((coordinates, index) => (
          <DirectionsLine
            key={index}
            coordinates={coordinates}
            color={routeColors[index % routeColors.length]}
          />
        ))}
      </MapView>

      <View className="z-50 flex px-5 w-100">
        <PrimaryButton
          label={isSameEndLocation ? "Submit" : "Add Transfers"}
          onPress={isSameEndLocation ? handleSubmitTrip : handleNavigateToRouteInput}
        />
      </View>

      <TripSummary startLocation={trip.startLocation} endLocation={trip.endLocation} trip={trip} />
      <TripSummary
        startLocation={trip.start_location}
        endLocation={trip.end_location}
        segments={segments}
      />
    </SafeAreaView>
  );
}
