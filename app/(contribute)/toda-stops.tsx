import React, { useState } from "react";
import { SafeAreaView, View, Alert } from "react-native";

import LocationSearchBar from "@/components/LocationSearchBar";
import Header from "@/components/ui/Header";
import TodaInformation from "@/components/contribute/TodaInformation";

import pin from "@/assets/pin-purple.png";

import Mapbox, {
  MapView,
  Camera,
  ShapeSource,
  SymbolLayer,
  Images,
} from "@rnmapbox/maps";
import { featureCollection, point } from "@turf/helpers";
import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TodaStops() {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  const handleMapPress = (event: any) => {
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
          followZoomLevel={15}
          centerCoordinate={coordinates || undefined}
          followUserLocation={!coordinates}
        />

        {coordinates && (
          <ShapeSource
            id="todas"
            shape={featureCollection([point(coordinates)])}
          >
            <SymbolLayer
              id="toda-icons"
              style={{
                iconImage: "pin",
                iconSize: 0.1,
              }}
            />
          </ShapeSource>
        )}

        <Images images={{ pin }} />
      </MapView>

      <TodaInformation coordinates={coordinates} />
    </SafeAreaView>
  );
}
