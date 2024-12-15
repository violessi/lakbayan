import React, { useRef, useEffect, useState } from "react";
import { router } from "expo-router";
import { useTrip } from "@/context/TripContext";

import { SafeAreaView, View, Alert } from "react-native";
import Header from "@/components/ui/Header";
import PrimaryButton from "@/components/ui/PrimaryButton";
import TripSummary from "@/components/contribute/TripSummary";
import DirectionsLine from "@/components/ui/DirectionsLine";
import TripTitle from "@/components/contribute/TripTitle";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TripReview() {
  const cameraRef = useRef<Camera>(null);
  const { trip } = useTrip();

  const routeCoordinates = trip.routes?.map((route) => route.directions.routes[0].geometry.coordinates) || [];
  const startCoordinates = trip.startCoordinates;
  const endCoordinates = trip.endCoordinates;

  const handleMapLoaded = () => {
    if (startCoordinates && endCoordinates && cameraRef.current) {
      cameraRef.current.fitBounds(startCoordinates, endCoordinates, [150, 150, 250, 150]);
    }
  };

  const handleNavigateToRouteInput = () => {
    router.push("/(contribute)/route-select-info");
  };

  const isSameEndLocation =
    trip.routes.length > 0 && trip.endLocation === trip.routes[trip.routes.length - 1].endLocation;

  const handleSubmitTrip = () => {
    Alert.alert("Trip Submitted", "Thank you for contributing to the community!");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Trip Review" />

      <View className="flex justify-center items-center">
        <TripTitle startLocation={trip.startLocation} endLocation={trip.endLocation} />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onDidFinishLoadingMap={handleMapLoaded}
      >
        <Camera ref={cameraRef} centerCoordinate={[121.05, 14.63]} animationMode="easeTo" zoomLevel={10} />

        {routeCoordinates.map((coordinates, index) => (
          <DirectionsLine key={index} coordinates={coordinates} />
        ))}
      </MapView>

      <View className="z-50">
        <PrimaryButton
          label={isSameEndLocation ? "Submit" : "Add Transfers"}
          onPress={isSameEndLocation ? handleSubmitTrip : handleNavigateToRouteInput}
        />
      </View>

      <TripSummary startLocation={trip.startLocation} endLocation={trip.endLocation} trip={trip} />
    </SafeAreaView>
  );
}
