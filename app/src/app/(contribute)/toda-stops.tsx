import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, View } from "react-native";

import LocationSearchBar from "@components/LocationSearchBar";
import Header from "@components/ui/Header";
import TodaInformation from "@components/contribute/TodaInformation";
import LocationMarker from "@components/ui/LocationMarker";
import pin from "@assets/pin-purple.png";

import Mapbox, { MapView, Camera, ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";
import { featureCollection, point } from "@turf/helpers";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { fetchStops } from "@services/toda-stop-service";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TodaStops() {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const cameraRef = useRef<Camera>(null);

  const [stops, setStops] = useState<StopData[]>([]);

  const loadStops = async () => {
    const result = await fetchStops();
    if (result) setStops(result);
  };

  useEffect(() => {
    loadStops();
  }, []);

  const handleMapPress = (feature: MapPressFeature) => {
    if (!feature.geometry || feature.geometry.type !== "Point") return;
    const coordinates = feature.geometry.coordinates as Coordinates;
    setCoordinates(coordinates);
    setZoomLevel(15);
  };

  const handleSuggestionSelect = (longitude: number, latitude: number) => {
    const newCoordinates: [number, number] = [longitude, latitude];
    setCoordinates(newCoordinates);
    setZoomLevel(16);
  };

  const handleClear = () => {
    setCoordinates(null);
    setZoomLevel(12);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Pin Toda Stops" />

      <View>
        <LocationSearchBar onSuggestionSelect={handleSuggestionSelect} onClear={handleClear} />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        onPress={handleMapPress}
        projection="mercator"
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={coordinates || [121.05, 14.63]}
          zoomLevel={zoomLevel}
          animationMode="easeTo"
        />

        {stops.map((stop) => (
          <LocationMarker
            key={stop.id}
            id={stop.id}
            coordinates={[stop.longitude, stop.latitude]}
            label={stop.name}
            color={stop.color.toLowerCase() === "none" ? "purple" : stop.color.toLowerCase()}
            radius={5}
          />
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
      </MapView>

      <TodaInformation coordinates={coordinates} onNewStopAdded={loadStops} />
    </SafeAreaView>
  );
}
