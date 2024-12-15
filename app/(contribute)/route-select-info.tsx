import React, { useRef, useState, useEffect } from "react";
import { router } from "expo-router";
import { useTrip } from "@/context/TripContext";

import { SafeAreaView, View } from "react-native";
import Header from "@/components/ui/Header";
import StartEndSearchBar from "@/components/StartEndSearchBar";
import TransportationModeSelection from "@/components/contribute/TransportationModeSelection";

import { TransportationMode } from "@/types/route-types";
import { Coordinates } from "@/types/location-types";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";
import { Button } from "react-native-paper";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteSelectInfo() {
  const { trip } = useTrip();
  const cameraRef = useRef<Camera>(null);
  const [transportationMode, setTransportationMode] = useState<TransportationMode | null>(null);

  let startRouteLocation = trip.startLocation as string;
  let startRouteCoordinates = trip.startCoordinates as Coordinates;

  if (trip.routes.length > 0) {
    startRouteLocation = trip.routes[trip.routes.length - 1].endLocation;
    startRouteCoordinates = trip.routes[trip.routes.length - 1].endCoordinates;
  }

  const [endRouteLocation, setEndRouteLocation] = useState<string | null>(null);
  const [endRouteCoordinates, setEndRouteCoordinates] = useState<[number, number] | null>(null);

  const handleEndRouteChange = (location: string, coordinates: [number, number]) => {
    setEndRouteLocation(location);
    setEndRouteCoordinates(coordinates);
  };

  const handleLastRoute = () => {
    setEndRouteLocation(trip.endLocation);
    setEndRouteCoordinates(trip.endCoordinates);
  };

  const handleTransportationModeChange = (mode: TransportationMode) => {
    setTransportationMode(mode);
  };

  const handleMapLoaded = () => {
    if (startRouteCoordinates && trip.endCoordinates && cameraRef.current) {
      cameraRef.current.fitBounds(startRouteCoordinates, trip.endCoordinates, [150, 150, 250, 150]);
    }
  };

  useEffect(() => {
    setEndRouteLocation(null);
    setEndRouteCoordinates(null);
  }, []);

  useEffect(() => {
    if (startRouteCoordinates && endRouteCoordinates && cameraRef.current) {
      cameraRef.current.fitBounds(startRouteCoordinates, endRouteCoordinates, [150, 150, 250, 150]);
    }
  }, [startRouteCoordinates, endRouteCoordinates]);

  useEffect(() => {
    if (startRouteLocation && startRouteCoordinates && endRouteLocation && endRouteCoordinates && transportationMode) {
      console.log("Navigate to route input");
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
  }, [startRouteLocation, startRouteCoordinates, endRouteLocation, endRouteCoordinates, transportationMode]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" />

      <View>
        <StartEndSearchBar
          onEndChange={handleEndRouteChange}
          defaultStart={startRouteLocation}
          isStartActive={false}
          defaultEnd={endRouteLocation}
        />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onDidFinishLoadingMap={handleMapLoaded}
      >
        <Camera ref={cameraRef} centerCoordinate={[121.05, 14.63]} zoomLevel={10} animationMode="easeTo" />
      </MapView>

      <View className="absolute bottom-0 mb-80 w-100">
        <Button mode="contained" onPress={handleLastRoute}>
          Final Location
        </Button>
      </View>

      <TransportationModeSelection onTransportationModeChange={handleTransportationModeChange} />
    </SafeAreaView>
  );
}
