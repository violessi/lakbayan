import React, { useRef, useState, useEffect } from "react";
import { router } from "expo-router";
import { useTrip } from "@contexts/TripContext";

import { SafeAreaView, View, Alert } from "react-native";
import Header from "@components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import StartEndSearchBar from "@components/StartEndSearchBar";
import TransportationModeSelection from "@components/contribute/TransportationModeSelection";

import Mapbox, { MapView, Camera, MarkerView } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { reverseGeocode } from "@services/mapbox-service";
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

  const handleMapPress = async (event: any) => {
    const coordinates = event.geometry.coordinates as [number, number];
    setEndRouteCoordinates(coordinates);

    const locationName = await reverseGeocode(coordinates, MAPBOX_ACCESS_TOKEN);
    setEndRouteLocation(locationName);
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
      <Header title="Route Information" />

      <View>
        <StartEndSearchBar
          onEndChange={(location, coordinates) => {
            setEndRouteLocation(location);
            setEndRouteCoordinates(coordinates);
          }}
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
        onPress={handleMapPress}
      >
        <Camera ref={cameraRef} centerCoordinate={[121.05, 14.63]} zoomLevel={10} animationMode="easeTo" />
        {endRouteCoordinates && (
          <MarkerView coordinate={endRouteCoordinates}>
            <View style={{ backgroundColor: "white", borderRadius: 5, padding: 5 }}>
              <Button mode="text">{endRouteLocation || "Pinned Location"}</Button>
            </View>
          </MarkerView>
        )}
      </MapView>

      <TransportationModeSelection onTransportationModeChange={handleTransportationModeChange} />

      <View className="z-50 flex px-5 w-100">
        <PrimaryButton label="Final Location" onPress={handleLastRoute} />
      </View>
    </SafeAreaView>
  );
}
