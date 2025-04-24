import React, { useMemo } from "react";
import { router } from "expo-router";
import { SafeAreaView, View, Alert, BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Header from "@components/ui/Header";
import { MapShell } from "@components/map/MapShell";
import SymbolMarker from "@components/map/SymbolMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import StartEndSearchBar from "@components/StartEndSearchBar";

import { useMapView } from "@hooks/use-map-view";
import { useDefaultStartLocation } from "@hooks/use-default-start-location";
import { reverseGeocode } from "@services/mapbox-service";
import { useTripCreator } from "@contexts/TripCreator";
import { insertSubmitLog } from "@services/logs-service";
import { useSession } from "@contexts/SessionContext";
import PrimaryButtonOutline from "@components/ui/PrimaryButtonOutline";

export default function CustomTrip() {
  const { user } = useSession();
  if (!user) throw new Error("User must be logged in to create a trip!");
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

  // Set the default start location to the user's current location if not already set
  useDefaultStartLocation({
    userLocation: userLocation ?? undefined,
    startLocation: trip.startLocation,
    onSetStart: handleStartChange,
    cameraRef,
    zoomLevel,
  });

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
  const handleConfirmLocation = async () => {
    if (trip.startLocation && trip.endLocation) {
      await insertSubmitLog({
        userId: user?.id,
        startLocation: trip.startLocation,
        startCoords: trip.startCoords ?? [0, 0],
        endLocation: trip.endLocation,
        endCoords: trip.endCoords ?? [0, 0],
        status: "ongoing",
      });
      console.log("Trip log created successfully.");
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

  const memoizedStart: [string | null, [number, number] | null] = useMemo(
    () => [trip.startLocation ?? null, trip.startCoords ?? null],
    [trip.startLocation, trip.startCoords],
  );
  const memoizedEnd: [string | null, [number, number] | null] = useMemo(
    () => [trip.endLocation ?? null, trip.endCoords ?? null],
    [trip.endLocation, trip.endCoords],
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header prevCallback={prevCallback} title="Custom Trips" />

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
        handleUserLocation={handleUserLocation}
      >
        {trip.startCoords && (
          <SymbolMarker id="start-loc" label="Start" coordinates={trip.startCoords} />
        )}
        {trip.endCoords && (
          <SymbolMarker id="end-loc" label="Destination" coordinates={trip.endCoords} />
        )}
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
