import React from "react";
import { router } from "expo-router";
import { SafeAreaView, View, Alert } from "react-native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import SymbolMarker from "@components/map/SymbolMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import StartEndSearchBar from "@components/StartEndSearchBar";

import { useMapView } from "@hooks/use-map-view";
import { reverseGeocode } from "@services/mapbox-service";
import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";

export default function CustomTrip() {
  const { trip, updateTrip } = useTripCreator();
  const { userLocation, cameraRef, zoomLevel, center, handleMapPress } = useMapView();

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
    if (!userLocation) throw new Error("User location not found.");
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

  // Navigate back to the previous screen.
  const prevCallback = () => router.replace("/(tabs)/contribute");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Custom Trips" prevCallback={prevCallback} />

      <View>
        <StartEndSearchBar
          defaultStart={trip.startLocation || "Starting location"}
          defaultEnd={trip.endLocation || "Destination"}
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
        />
      </View>

      <MapShell
        center={center}
        zoomLevel={zoomLevel}
        cameraRef={cameraRef}
        handleMapPress={(feature) => handleMapPress(feature, confirmationAlert)}
      >
        <SymbolMarker
          id="start-location"
          label={trip.startLocation.split(",")[0]}
          coordinates={trip.startCoords}
        />
        <SymbolMarker
          id="end-location"
          label={trip.endLocation.split(",")[0]}
          coordinates={trip.endCoords}
        />
      </MapShell>

      <View className="absolute bottom-0 z-50 flex flex-row gap-2 p-5 w-full justify-center">
        <PrimaryButton label="Use Current Location" onPress={handleUseCurrentLoc} />
        <PrimaryButton label="Confirm" onPress={handleConfirmLocation} />
      </View>
    </SafeAreaView>
  );
}
