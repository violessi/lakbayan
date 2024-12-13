import React, { useRef } from "react";

import { SafeAreaView, View } from "react-native";
import Header from "@/components/ui/Header";
import RouteInformation from "@/components/contribute/RouteInformation";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface Coordinates {
  lat: number;
  long: number;
}

export default function RouteInput() {
  const cameraRef = useRef<Camera>(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" />

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
