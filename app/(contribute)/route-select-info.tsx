import React, { useRef, useState, useEffect, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

import { SafeAreaView, View, Alert } from "react-native";
import Header from "@/components/ui/Header";
import StartEndSearchBar from "@/components/StartEndSearchBar";
import TransportationModeSelection from "@/components/contribute/TransportationModeSelection";

import { TransportationMode } from "@/types/route-types";
import { Coordinates } from "@/types/location-types";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

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

  const startRouteLocation = startLocationParams as string;
  const startRouteCoordinates: Coordinates = useMemo(() => {
    return JSON.parse(startCoordinatesParams as string);
  }, [startCoordinatesParams]);

  const endLocation = endLocationParams as string;
  const endCoordinates: Coordinates = useMemo(() => {
    return JSON.parse(endCoordinatesParams as string);
  }, [endCoordinatesParams]);

  const [endRouteLocation, setEndRouteLocation] = useState<string | null>(null);
  const [endRouteCoordinates, setEndRouteCoordinates] = useState<
    [number, number] | null
  >(null);

  const handleEndRouteChange = (
    location: string,
    coordinates: [number, number],
  ) => {
    setEndRouteLocation(location);
    setEndRouteCoordinates(coordinates);
  };

  const handleTransportationModeChange = (mode: TransportationMode) => {
    setTransportationMode(mode);
  };

  useEffect(() => {
    if (
      startRouteLocation &&
      startRouteCoordinates &&
      endRouteLocation &&
      endRouteCoordinates &&
      transportationMode
    ) {
      router.push({
        pathname: "/route-input",
        params: {
          startRouteLocationParams: startRouteLocation,
          startRouteCoordinatesParams: JSON.stringify(startRouteCoordinates),
          endRouteLocationParams: endRouteLocation,
          endRouteCoordinatesParams: JSON.stringify(endRouteCoordinates),
          transportationModeParams: transportationMode,
        },
      });
    }
  }, [
    startRouteLocation,
    startRouteCoordinates,
    endRouteLocation,
    endRouteCoordinates,
    transportationMode,
  ]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" />

      <View>
        <StartEndSearchBar
          onEndChange={handleEndRouteChange}
          defaultStart={startRouteLocation}
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
