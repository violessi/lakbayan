import React, { useRef } from "react";
import { useLocalSearchParams } from "expo-router";

import { SafeAreaView, View, Text } from "react-native";
import Header from "@/components/ui/Header";
import RouteInformation from "@/components/contribute/RouteInformation";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteInput() {
  const cameraRef = useRef<Camera>(null);

  const {
    startRouteLocationParams,
    startRouteCoordinatesParams,
    endRouteLocationParams,
    endRouteCoordinatesParams,
    transportationModeParams,
  } = useLocalSearchParams();

  const startRouteLocation = startRouteLocationParams as string;
  const startRouteCoordinates = JSON.parse(
    startRouteCoordinatesParams as string,
  );
  const endRouteLocation = endRouteLocationParams as string;
  const endRouteCoordinates = JSON.parse(endRouteCoordinatesParams as string);
  const transportationMode = transportationModeParams as string;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" />
      <View className="mt-2 flex justify-center">
        <Text>
          {startRouteLocation} to {endRouteLocation} via {transportationMode}
        </Text>
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={[121.05, 14.63]}
          zoomLevel={14}
          animationMode="easeTo"
        />
      </MapView>

      <RouteInformation />
    </SafeAreaView>
  );
}
