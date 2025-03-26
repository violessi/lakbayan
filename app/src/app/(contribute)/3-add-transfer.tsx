import { router } from "expo-router";
import React, { useRef } from "react";
import { SafeAreaView, View, Alert } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import Header from "@components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import CircleMarker from "@components/map/CircleMarker";
import StartEndSearchBar from "@components/StartEndSearchBar";
import TransportationModeSelection from "@components/contribute/TransportationModeSelection";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { reverseGeocode } from "@services/mapbox-service";
import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteSelectInfo() {
  // Destructure both trip and segments from context
  const { trip, route, updateRoute } = useTripCreator();
  const cameraRef = useRef<Camera>(null);

  // When user updates the destination using search bar
  const handleDestinationSearch = (endLocation: string, endCoords: Coordinates) => {
    updateRoute({ endLocation, endCoords });
    if (cameraRef.current) cameraRef.current.moveTo(endCoords, 1000);
  };

  // When user updates the destination by pressing the map
  const handleMapPress = async (event: any) => {
    const coordinates = event.geometry.coordinates as [number, number];
    const location = await reverseGeocode(coordinates);
    updateRoute({ endLocation: location, endCoords: coordinates });
    if (cameraRef.current) cameraRef.current.moveTo(coordinates, 1000);
  };

  // Prefill the final segment with the trip's end location
  const handleFinalTransfer = () => {
    updateRoute({ endLocation: trip.endLocation, endCoords: trip.endCoords });
    if (!route.segmentMode) {
      Alert.alert("Missing Information", "Please fill in all fields to proceed.");
      return;
    }
    router.push("/(contribute)/4-edit-transfer");
  };

  // Once we have all necessary information, navigate to the next screen.
  const handleAddTransfer = () => {
    if (!route.endLocation || !route.endCoords || !route.segmentMode) {
      Alert.alert("Missing Information", "Please fill in all fields to proceed.");
      return;
    }
    router.push("/(contribute)/4-edit-transfer");
  };

  const handleMapLoaded = () => {
    if (cameraRef.current) {
      cameraRef.current.fitBounds(route.startCoords, trip.endCoords, [150, 150, 250, 150]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Information" />

      <View>
        <StartEndSearchBar
          onEndChange={handleDestinationSearch}
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

      <TransportationModeSelection
        onTransportationModeChange={(segmentMode) => updateRoute({ segmentMode })}
      />

      <View className="z-50 flex flex-row gap-4 p-5 justify-center">
        <PrimaryButton label="Final Location" onPress={handleFinalTransfer} />
        <PrimaryButton label="Add Transfer" onPress={handleAddTransfer} />
      </View>
    </SafeAreaView>
  );
}
