import { router } from "expo-router";
import { Button } from "react-native-paper";
import { SafeAreaView, View, Alert } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import Mapbox, { MapView, Camera, MarkerView } from "@rnmapbox/maps";

import Header from "@components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import CircleMarker from "@components/map/CircleMarker";
import StartEndSearchBar from "@components/StartEndSearchBar";
import TransportationModeSelection from "@components/contribute/TransportationModeSelection";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

import { useCreateTrip } from "@contexts/CreateTripContext";
import { reverseGeocode } from "@services/mapbox-service";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteSelectInfo() {
  // Destructure both trip and segments from context
  const { trip, segments, route, updateRoute } = useCreateTrip();
  const cameraRef = useRef<Camera>(null);

  const len = segments.length;
  route.startLocation = len > 0 ? segments[len - 1].endLocation : trip.startLocation;
  route.startCoords = len > 0 ? segments[len - 1].endCoords : trip.startCoords;

  // When the user updates a location as "Destination", update the end values.
  const handleEndChange = (location: string, coords: Coordinates) => {
    if (cameraRef.current) cameraRef.current.moveTo(coords, 1000);
    updateRoute({ endLocation: location, endCoords: coords });
  };

  const handleMapPress = async (event: any) => {
    const coordinates = event.geometry.coordinates as [number, number];
    const location = await reverseGeocode(coordinates);
    updateRoute({ endLocation: location, endCoords: coordinates });
    if (cameraRef.current) cameraRef.current.moveTo(coordinates, 1000);
  };

  // Update final route values using the trip's end_location and end_coords
  const handleLastRoute = () => {
    updateRoute({ endLocation: trip.endLocation, endCoords: trip.endCoords });
  };

  const handleTransportationModeChange = (mode: TransportationMode) => {
    updateRoute({ segmentMode: mode });
  };

  const handleMapLoaded = () => {
    if (cameraRef.current) {
      cameraRef.current.fitBounds(route.startCoords, trip.endCoords, [150, 150, 250, 150]);
    }
  };

  // Once we have all necessary information, navigate to the next screen.
  const handleConfirmLocation = () => {
    if (!route.startLocation || !route.endLocation || !route.segmentMode) {
      Alert.alert("Missing Information", "Please fill in all fields to proceed.");
      return;
    }
    router.push({ pathname: "/route-input" });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Information" />

      <View>
        <StartEndSearchBar
          onEndChange={handleEndChange}
          defaultStart={route.startLocation}
          isStartActive={false}
          defaultEnd={route.endLocation}
        />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onDidFinishLoadingMap={handleMapLoaded}
        onPress={handleMapPress}
      >
        <Camera ref={cameraRef} zoomLevel={10} animationMode="easeTo" />
        <CircleMarker
          id="start-location"
          coordinates={route.startCoords}
          label={route.startLocation}
          color="red"
          radius={8}
        />
        <CircleMarker
          id="next-location"
          coordinates={route.endCoords}
          label={route.endLocation}
          color="blue"
          radius={8}
        />
        <CircleMarker
          id="end-location"
          coordinates={trip.endCoords}
          label={trip.endLocation}
          color="green"
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
