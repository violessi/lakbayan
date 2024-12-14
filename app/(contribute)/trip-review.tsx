import React, { useRef } from "react";
import { router } from "expo-router";
import { useTrip } from "@/context/TripContext";

import { SafeAreaView, View } from "react-native";
import Header from "@/components/ui/Header";
import PrimaryButton from "@/components/ui/PrimaryButton";
import TripSummary from "@/components/contribute/TripSummary";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TripReview() {
  const { trip } = useTrip();

  const cameraRef = useRef<Camera>(null);

  const handleNavigateToRouteInput = () => {
    router.push("/(contribute)/route-select-info");
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

      <TripSummary startLocation={trip.startLocation} endLocation={trip.endLocation} trip={trip} />
    </SafeAreaView>
  );
}
