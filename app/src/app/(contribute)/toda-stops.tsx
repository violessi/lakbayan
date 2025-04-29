import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { ActivityIndicator, Alert, SafeAreaView, View, Text, BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import LocationSearchBar from "@components/LocationSearchBar";
import Header from "@components/ui/Header";
import TodaInformation from "@components/contribute/TodaInformation";
import TodaMarker from "@components/map/TodaMarker";
import pin from "@assets/pin-purple.png";
import UnsavedChangesAlert from "@components/contribute/UnsavedChangesAlert";

import { MapShell } from "@components/map/MapShell";

import { useMapView } from "@hooks/use-map-view";

import { ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";
import { featureCollection, point } from "@turf/helpers";
import { fetchStops } from "@services/toda-stop-service";

export default function TodaStops() {
  const {
    coordinates,
    center,
    zoomLevel,
    cameraRef,
    handleMapPress,
    handleSuggestionSelect,
    handleClear,
    handleUserLocation,
  } = useMapView(12);

  const [stops, setStops] = useState<StopData[]>([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [formSnapshot, setFormSnapshot] = useState("");

  const loadStops = async () => {
    setLoadingStops(true);
    try {
      const response = await fetchStops();
      setStops(response);
    } catch (error) {
      Alert.alert("Error", "Unable to fetch stops. Please try again later.");
      console.error("Error fetching stops:", error);
    } finally {
      setLoadingStops(false);
    }
  };

  useEffect(() => {
    loadStops();
  }, []);

  // Navigation

  const hasChanges = !!formSnapshot;

  const handleBackPress = useCallback(() => {
    if (hasChanges) {
      UnsavedChangesAlert(() => router.replace("/(tabs)/contribute"));
    } else {
      router.replace("/(tabs)/contribute");
    }
  }, [hasChanges]);

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBackPress();
      return true;
    });
    return () => backHandler.remove();
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Pin Toda Stops" prevCallback={handleBackPress} />

      <View>
        <LocationSearchBar onSuggestionSelect={handleSuggestionSelect} onClear={handleClear} />
      </View>

      <MapShell
        center={center}
        zoomLevel={zoomLevel}
        cameraRef={cameraRef}
        handleMapPress={handleMapPress}
        handleUserLocation={handleUserLocation}
      >
        {stops.map((stop) => (
          <TodaMarker key={stop.id} stop={stop} />
        ))}

        {coordinates && (
          <ShapeSource id="todas" existing shape={featureCollection([point(coordinates)])}>
            <SymbolLayer
              id="toda-icons"
              style={{
                iconImage: "pin",
                iconSize: 0.1,
              }}
              existing
            />
          </ShapeSource>
        )}
        <Images images={{ pin }} />
      </MapShell>
      {loadingStops && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/50 z-50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white">Loading stops...</Text>
        </View>
      )}
      <TodaInformation
        coordinates={coordinates}
        onNewStopAdded={loadStops}
        onFormChange={(form) => setFormSnapshot(JSON.stringify(form))}
      />
    </SafeAreaView>
  );
}
