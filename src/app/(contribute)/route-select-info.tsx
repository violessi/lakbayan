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
  // Destructure both trip and segments from context
  const { trip, segments } = useTrip();
  const cameraRef = useRef<Camera>(null);

  const [transportationMode, setTransportationMode] = useState<TransportationMode | null>(null);

  let startRouteLocation = trip.startLocation as string;
  let startRouteCoordinates = trip.startCoordinates as Coordinates;
  // Default start location and coordinates come from the trip
  let startRouteLocation = trip.start_location as string;
  let startRouteCoordinates = trip.start_coords as Coordinates;

  if (trip.routes.length > 0) {
    startRouteLocation = trip.routes[trip.routes.length - 1].endLocation;
    startRouteCoordinates = trip.routes[trip.routes.length - 1].endCoordinates;
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

    const locationName = await reverseGeocode(coordinates, MAPBOX_ACCESS_TOKEN);
    const locationName = await reverseGeocode(coordinates);
    setEndRouteLocation(locationName);
  };

  // Update final route values using the trip's end_location and end_coords
  const handleLastRoute = () => {
    setEndRouteLocation(trip.endLocation);
    setEndRouteCoordinates(trip.endCoordinates);
    setEndRouteLocation(trip.end_location);
    setEndRouteCoordinates(trip.end_coords);
  };

  const handleTransportationModeChange = (mode: TransportationMode) => {
    setTransportationMode(mode);
  };

  const handleMapLoaded = () => {
    if (startRouteCoordinates && trip.endCoordinates && cameraRef.current) {
      cameraRef.current.fitBounds(startRouteCoordinates, trip.endCoordinates, [150, 150, 250, 150]);
    if (startRouteCoordinates && trip.end_coords && cameraRef.current) {
      cameraRef.current.fitBounds(startRouteCoordinates, trip.end_coords, [150, 150, 250, 150]);
    }
  };

  useEffect(() => {
    setEndRouteLocation(null);
    setEndRouteCoordinates(null);
  }, []);

  // Once we have all necessary information, navigate to the next screen.
  useEffect(() => {
    if (startRouteLocation && startRouteCoordinates && endRouteLocation && endRouteCoordinates && transportationMode) {
    if (
      startRouteLocation &&
      startRouteCoordinates &&
      endRouteLocation &&
      endRouteCoordinates &&
      transportationMode
    ) {
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
        <LocationMarker
          coordinates={startRouteCoordinates}
          label={startRouteLocation}
          color="red"
          radius={8}
        />
      </MapView>

      <TransportationModeSelection onTransportationModeChange={handleTransportationModeChange} />

      <View className="z-50 flex px-5 w-100">
        <PrimaryButton label="Final Location" onPress={handleLastRoute} />
      </View>
    </SafeAreaView>
  );
}
