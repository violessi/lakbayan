import React, { useState } from "react";

import { SafeAreaView, View } from "react-native";
import LocationSearchBar from "../../components/LocationSearchBar";
import Header from "../../components/ui/Header";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "../../utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TodaStops() {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  const handleMapPress = (event) => {
    const { geometry } = event;
    const { coordinates } = geometry;
    setCoordinates(coordinates);
  };

  const handleSuggestionSelect = (longitude: number, latitude: number) => {
    setCoordinates([longitude, latitude]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Pin Toda Stops" />

      <View>
        <LocationSearchBar
          onSuggestionSelect={handleSuggestionSelect}
          onClear={() => {
            setCoordinates(null);
          }}
        />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        onPress={handleMapPress}
      >
        <Camera
          followZoomLevel={16}
          centerCoordinate={coordinates || undefined}
          followUserLocation={!coordinates}
        />
      </MapView>
    </SafeAreaView>
  );
}
