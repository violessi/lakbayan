import React, { useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

import { SafeAreaView, View, Alert } from "react-native";
import Header from "@/components/ui/Header";
import StartEndSearchBar from "@/components/StartEndSearchBar";
import TransportationModeSelection from "@/components/contribute/TransportationModeSelection";

import { TransportationMode } from "@/types/route-types";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface Coordinates {
  lat: number;
  long: number;
}

export default function RouteSelectInfo() {
  const cameraRef = useRef<Camera>(null);
  const [transportationMode, setTransportationMode] =
    useState<TransportationMode | null>(null);

  const {
    startLocationParams,
    startCoordinatesParams,
    endLocationParams,
    endCoordinatesParams,
  } = useLocalSearchParams();

  const startLocation = startLocationParams as string;
  const endLocation = endLocationParams as string;

  const startCoordinates: Coordinates = {
    lat: JSON.parse(startCoordinatesParams as string)[0],
    long: JSON.parse(startCoordinatesParams as string)[1],
  };
  const endCoordinates = {
    lat: JSON.parse(endCoordinatesParams as string)[0],
    long: JSON.parse(endCoordinatesParams as string)[1],
  };

  const [startRouteLocation, setStartRouteLocation] = useState<string | null>(
    null
  );
  const [startRouteCoordinates, setStartRouteCoordinates] = useState<
    [number, number] | null
  >(null);
  const [endRouteLocation, setEndRouteLocation] = useState<string | null>(null);
  const [endRouteCoordinates, setEndRouteCoordinates] = useState<
    [number, number] | null
  >(null);

  const handleStartRouteChange = (
    location: string,
    coordinates: [number, number]
  ) => {
    setStartRouteLocation(location);
    setStartRouteCoordinates(coordinates);
  };

  const handleEndRouteChange = (
    location: string,
    coordinates: [number, number]
  ) => {
    setEndRouteLocation(location);
    setEndRouteCoordinates(coordinates);
  };

  const handleTransportationModeChange = (mode: TransportationMode) => {
    setTransportationMode(mode);
    Alert.alert("Transportation Mode", `Selected: ${mode}`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" />

      <View>
        <StartEndSearchBar
          onStartChange={handleStartRouteChange}
          onEndChange={handleEndRouteChange}
          defaultStart={startLocation}
          isStartActive={false}
        />
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

      <TransportationModeSelection
        onTransportationModeChange={handleTransportationModeChange}
      />
    </SafeAreaView>
  );
}
