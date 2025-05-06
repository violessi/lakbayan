import React, { useMemo } from "react";
import { useRouter } from "expo-router";
import { Alert, SafeAreaView, View } from "react-native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import SymbolMarker from "@components/map/SymbolMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import PrimaryButtonOutline from "@components/ui/PrimaryButtonOutline";
import StartEndSearchBar from "@components/StartEndSearchBar";

import { useMapView } from "@hooks/use-map-view";
import { useDefaultStartLocation } from "@hooks/use-default-start-location";
import { useTripSearch } from "@contexts/TripSearchContext";
import { reverseGeocode } from "@services/mapbox-service";

// NOTE: Same component as contribyte-create-trip
export default function SearchTrip() {
  const router = useRouter();
  const { userLocation, cameraRef, zoomLevel, handleMapPress, center } = useMapView();
  const { tripEndpoints, updateTripEndpoints, fetchSuggestedTrips } = useTripSearch();
  const { startLocation, endLocation, startCoords, endCoords } = tripEndpoints || {};

  // When the user updates a location as "Source".
  const handleStartChange = (startLocation: string, startCoords: Coordinates) => {
    updateTripEndpoints({ startLocation, startCoords });
    cameraRef.current?.moveTo(startCoords, 1000);
  };

  // Set the default start location to the user's current location if not already set
  useDefaultStartLocation({
    userLocation: userLocation ?? undefined,
    startLocation,
    onSetStart: handleStartChange,
    cameraRef,
    zoomLevel,
  });

  // When the user updates a location as "Destination".
  const handleEndChange = (endLocation: string, endCoords: Coordinates) => {
    updateTripEndpoints({ endLocation, endCoords });
    cameraRef.current?.moveTo(endCoords, 1000);
  };

  // Allow users to use current location as start or end location.
  const handleUseCurrentLoc = async () => {
    if (!userLocation) {
      Alert.alert("Error", "User location not found.");
      throw new Error("User location not found.");
    }
    confirmationAlert(userLocation);
  };

  // When the user presses Confirm, navigate to the next screen if both locations are set.
  const handleConfirmLocation = async () => {
    if (!tripEndpoints?.startLocation || !tripEndpoints?.endLocation) {
      Alert.alert("Please select both a source and destination.");
      return;
    }
    try {
      await fetchSuggestedTrips();
      router.replace("/(search)/2-trip-suggestions");
    } catch (error) {
      Alert.alert("Error fetching trips. Please try again.");
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
  const prevCallback = () => router.replace("/(tabs)");

  const memoizedStart: [string | null, [number, number] | null] = useMemo(
    () => [startLocation ?? null, startCoords ?? null],
    [startLocation, startCoords],
  );

  const memoizedEnd: [string | null, [number, number] | null] = useMemo(
    () => [endLocation ?? null, endCoords ?? null],
    [endLocation, endCoords],
  );

  return (
    <SafeAreaView className="flex-1">
      <Header prevCallback={prevCallback} title="Where are we off to today?" />
      <View>
        <StartEndSearchBar
          start={memoizedStart}
          end={memoizedEnd}
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
        />
      </View>

      <MapShell
        center={center}
        zoomLevel={zoomLevel}
        cameraRef={cameraRef}
        handleMapPress={handlePress}
      >
        {startCoords && <SymbolMarker id="start-loc" label="Start" coordinates={startCoords} />}
        {endCoords && <SymbolMarker id="end-loc" label="Destination" coordinates={endCoords} />}
      </MapShell>

      <View className="absolute bottom-0 z-50 flex flex-row gap-2 p-5 w-full justify-center">
        <PrimaryButtonOutline onPress={handleUseCurrentLoc}>
          Use Current Location
        </PrimaryButtonOutline>
        <PrimaryButton label="Confirm" onPress={handleConfirmLocation} />
      </View>
    </SafeAreaView>
  );
}
