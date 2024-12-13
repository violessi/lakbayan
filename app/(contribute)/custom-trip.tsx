import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, View, Alert } from "react-native";
import { router } from "expo-router";

import StartEndSearchBar from "../../components/StartEndSearchBar";
import Header from "../../components/ui/Header";

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

  const [startLocation, setStartLocation] = useState<string | null>(null);
  const [startCoordinates, setStartCoordinates] = useState<
    [number, number] | null
  >(null);
  const [endLocation, setEndLocation] = useState<string | null>(null);
  const [endCoordinates, setEndCoordinates] = useState<[number, number] | null>(
    null
  );

  const handleStartChange = (
    location: string,
    coordinates: [number, number]
  ) => {
    setStartLocation(location);
    setStartCoordinates(coordinates);
  };

  const handleEndChange = (location: string, coordinates: [number, number]) => {
    setEndLocation(location);
    setEndCoordinates(coordinates);
  };

  const cameraRef = useRef<Camera>(null);

  const handleMapPress = (event: any) => {
    const { geometry } = event;
    const { coordinates } = geometry;
    setCoordinates(coordinates);
  };

  const handleZoomChange = (event: any) => {
    const { zoom } = event.properties;
    setZoomLevel(zoom);
  };

  useEffect(() => {
    if (startCoordinates && endCoordinates) {
      router.push({
        pathname: "/(contribute)/trip-review",
        params: {
          startLocationParams: startLocation,
          startCoordinatesParams: JSON.stringify(startCoordinates),
          endLocationParams: endLocation,
          endCoordinatesParams: JSON.stringify(endCoordinates),
        },
      });
    }
  }, [startLocation, startCoordinates, endLocation, endCoordinates]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Custom Trips" />

      <View>
        <StartEndSearchBar
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
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
    </SafeAreaView>
  );
}
