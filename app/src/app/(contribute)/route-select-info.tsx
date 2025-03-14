import React, { useRef, useState, useEffect } from "react";
import { router } from "expo-router";
import { useTrip } from "@contexts/TripContext";

import { SafeAreaView, View, Alert } from "react-native";
import Header from "@components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import LocationMarker from "@components/ui/LocationMarker";
import StartEndSearchBar from "@components/StartEndSearchBar";
import TransportationModeSelection from "@components/contribute/TransportationModeSelection";

import Mapbox, { MapView, Camera, MarkerView } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { reverseGeocode } from "@services/mapbox-service";
import { Button } from "react-native-paper";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteSelectInfo() {
  // Destructure both trip and segments from context
  const { trip, segments } = useTrip();
  const cameraRef = useRef<Camera>(null);

  const [transportationMode, setTransportationMode] = useState<TransportationMode | null>(null);

  // Default start location and coordinates come from the trip
  let startRouteLocation = trip.start_location as string;
  let startRouteCoordinates = trip.start_coords as Coordinates;

  // If there are any segments, use the end of the last segment as the start for the new leg
  if (segments.length > 0) {
    startRouteLocation = segments[segments.length - 1].end_location;
    startRouteCoordinates = segments[segments.length - 1].end_coords;
  }

  const [endRouteLocation, setEndRouteLocation] = useState<string | null>(null);
  const [endRouteCoordinates, setEndRouteCoordinates] = useState<[number, number] | null>(null);

  const handleMapPress = async (event: any) => {
    const coordinates = event.geometry.coordinates as [number, number];
    setEndRouteCoordinates(coordinates);

    const locationName = await reverseGeocode(coordinates);
    setEndRouteLocation(locationName);
  };

  // Update final route values using the trip's end_location and end_coords
  const handleLastRoute = () => {
    setEndRouteLocation(trip.end_location);
    setEndRouteCoordinates(trip.end_coords);
  };

  const handleTransportationModeChange = (mode: TransportationMode) => {
    setTransportationMode(mode);
  };

  const handleMapLoaded = () => {
    if (startRouteCoordinates && trip.end_coords && cameraRef.current) {
      cameraRef.current.fitBounds(startRouteCoordinates, trip.end_coords, [150, 150, 250, 150]);
    }
  };

  useEffect(() => {
    setEndRouteLocation(null);
    setEndRouteCoordinates(null);
  }, []);

  // Once we have all necessary information, navigate to the next screen.
  const handleConfirmLocation = () => {
    if (!startRouteLocation || !startRouteCoordinates || !endRouteLocation || !endRouteCoordinates || !transportationMode) {
      Alert.alert("Missing Information", "Please fill in all fields to proceed.");
      return;
    }

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
  };

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
        <LocationMarker
          coordinates={startRouteCoordinates}
          label={startRouteLocation}
          color="red"
          radius={8}
        />
      </MapView>

      <TransportationModeSelection onTransportationModeChange={handleTransportationModeChange} />

      <View className="z-50 flex flex-row gap-4 p-5 justify-center">
        <PrimaryButton label="Final Location" onPress={handleLastRoute} />
        <PrimaryButton label="Confirm" onPress={handleConfirmLocation} />
      </View>
    </SafeAreaView>
  );
}
