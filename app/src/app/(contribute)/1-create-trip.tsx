import React from "react";
import { router } from "expo-router";
import { SafeAreaView, View, Alert, BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import SymbolMarker from "@components/map/SymbolMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import StartEndSearchBar from "@components/StartEndSearchBar";

import { useMapView } from "@hooks/use-map-view";
import { reverseGeocode } from "@services/mapbox-service";
import { useTripCreator } from "@contexts/TripCreator";

export default function CustomTrip() {
  const { trip, updateTrip } = useTripCreator();
  const { userLocation, cameraRef, zoomLevel, center, handleMapPress, handleUserLocation } =
    useMapView();

  // When the user updates a location as "Source".
  const handleStartChange = (location: string, coords: Coordinates) => {
    updateTrip({ startLocation: location, startCoords: coords });
    cameraRef.current?.moveTo(coords, 1000);
  };

  // When the user updates a location as "Destination".
  const handleEndChange = (location: string, coords: Coordinates) => {
    updateTrip({ endLocation: location, endCoords: coords });
    cameraRef.current?.moveTo(coords, 1000);
  };

  // Allow users to use current location as start or end location.
  const handleUseCurrentLoc = async () => {
    console.log(userLocation);
    if (!userLocation) {
      Alert.alert("Error", "User location not found.");
      throw new Error("User location not found.");
    }
    confirmationAlert(userLocation);
  };

  // When the user presses Confirm, navigate to the next screen if both locations are set.
  const handleConfirmLocation = () => {
    if (trip.startLocation && trip.endLocation) {
      router.replace("/(contribute)/2-review-trip");
    } else {
      Alert.alert("Please select both a source and destination.");
    }
  };

  // Alert asking if the location is Source or Destination.
  const confirmationAlert = async (coords: Coordinates) => {
    const location = (await reverseGeocode(coords)) as string;
    Alert.alert(
      "Confirm Location",
      `Do you want to set ${location} as your source or destination?`,
      [
        { text: "Cancel" },
        { text: "Source", onPress: () => handleStartChange(location, coords) },
        { text: "Destination", onPress: () => handleEndChange(location, coords) },
      ],
    );
  };

  // Handle map press event with confirmation alert.
  const handlePress = (feature: MapPressFeature) => {
    handleMapPress(feature, confirmationAlert);
  };

  // Navigate back to the previous screen.
  const prevCallback = () => router.replace("/(tabs)/contribute");

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      prevCallback();
      return true;
    });
    return () => backHandler.remove();
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header prevCallback={prevCallback} title="Custom Trips" />

      <View>
        <StartEndSearchBar
          start={[trip.startLocation, trip.startCoords]}
          end={[trip.endLocation, trip.endCoords]}
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
        />
      </View>

      <MapShell
        center={center}
        zoomLevel={zoomLevel}
        cameraRef={cameraRef}
        handleMapPress={handlePress}
        handleUserLocation={handleUserLocation}
      >
        <SymbolMarker id="start-loc" label="Start" coordinates={trip.startCoords} />
        <SymbolMarker id="end-loc" label="Destination" coordinates={trip.endCoords} />
      </MapShell>

      <View className="absolute bottom-0 z-50 flex flex-row gap-2 p-5 w-full justify-center">
        <PrimaryButton label="Use Current Location" onPress={handleUseCurrentLoc} />
        <PrimaryButton label="Confirm" onPress={handleConfirmLocation} />
      </View>
    </SafeAreaView>
  );
}
