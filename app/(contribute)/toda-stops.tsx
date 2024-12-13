import React, { useRef, useState } from "react";
import { SafeAreaView, View } from "react-native";
import LocationSearchBar from "../../components/LocationSearchBar";
import Header from "../../components/ui/Header";

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
  const [zoomLevel, setZoomLevel] = useState(12);
  const cameraRef = useRef<Camera>(null);

  const handleMapPress = (event: any) => {
    const { geometry } = event;
    const { coordinates } = geometry;
    setCoordinates(coordinates);
  };

  const handleSuggestionSelect = (longitude: number, latitude: number) => {
    const newCoordinates: [number, number] = [longitude, latitude];
    setCoordinates(newCoordinates);
  };

  const handleZoomChange = (event: any) => {
    const { zoom } = event.properties;
    setZoomLevel(zoom);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Pin Toda Stops" />

      <View>
        <LocationSearchBar
          onSuggestionSelect={handleSuggestionSelect}
          onClear={() => setCoordinates(null)}
        />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        onPress={handleMapPress}
        onRegionDidChange={handleZoomChange}
        projection="mercator"
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={coordinates || [121.05, 14.63]}
          zoomLevel={zoomLevel}
          animationMode="easeTo"
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
