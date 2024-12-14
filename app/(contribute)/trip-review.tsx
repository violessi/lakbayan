import React, { useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

import { SafeAreaView, View } from "react-native";
import Header from "@/components/ui/Header";
import PrimaryButton from "@/components/ui/PrimaryButton";
import TripSummary from "@/components/contribute/TripSummary";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";
import { Route } from "@/types/route-types";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface Coordinates {
  lat: number;
  long: number;
}

export default function TripReview() {
  const cameraRef = useRef<Camera>(null);

  const { startLocationParams, startCoordinatesParams, endLocationParams, endCoordinatesParams } =
    useLocalSearchParams();

  const startLocation = startLocationParams as string;
  const endLocation = endLocationParams as string;

  const startCoordinates: Coordinates = JSON.parse(startCoordinatesParams as string);
  const endCoordinates: Coordinates = JSON.parse(endCoordinatesParams as string);

  const handleNavigateToRouteInput = () => {
    router.push({
      pathname: "/(contribute)/route-select-info",
      params: {
        startLocationParams: startLocation,
        startCoordinatesParams: JSON.stringify(startCoordinates),
        endLocationParams: endLocation,
        endCoordinatesParams: JSON.stringify(endCoordinates),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Trip Review" />

      <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12" projection="mercator">
        <Camera ref={cameraRef} centerCoordinate={[121.05, 14.63]} zoomLevel={14} animationMode="easeTo" />
      </MapView>
      <View className="z-50">
        <PrimaryButton label="Add Transfers" onPress={handleNavigateToRouteInput} />
      </View>
      <TripSummary startLocation={startLocation} endLocation={endLocation} />
    </SafeAreaView>
  );
}
