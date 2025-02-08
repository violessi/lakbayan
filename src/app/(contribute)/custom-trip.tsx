import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, View } from "react-native";
import { router } from "expo-router";
import { useTrip } from "@contexts/TripContext";

import StartEndSearchBar from "../../components/StartEndSearchBar";
import Header from "../../components/ui/Header";

import pin from "@assets/pin-purple.png";

import Mapbox, { MapView, Camera, ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";
import { featureCollection, point } from "@turf/helpers";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function CustomTrip() {
  const { trip, setStartEndLocations } = useTrip();
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);

  const handleStartChange = (location: string, coordinates: [number, number]) => {
    setStartEndLocations(location, coordinates, trip.end_location, trip.end_coords || [0, 0]);
  };

  const handleEndChange = (location: string, coordinates: [number, number]) => {
    setStartEndLocations(trip.start_location, trip.start_coords || [0, 0], location, coordinates);
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
    if (trip.start_location !== "" && trip.end_location !== "") {
      router.push("/(contribute)/trip-review");
    }
  }, [trip]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Custom Trips" />

      <View>
        <StartEndSearchBar onStartChange={handleStartChange} onEndChange={handleEndChange} />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        // onPress={handleMapPress}
        onRegionDidChange={handleZoomChange}
        projection="mercator"
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={coordinates || [121.05, 14.63]}
          zoomLevel={zoomLevel}
          animationMode="easeTo"
        />

        {trip.start_coords && (
          <ShapeSource id="start-location" shape={featureCollection([point(trip.start_coords)])}>
            <SymbolLayer
              id="start-location-icon"
              style={{
                iconImage: "pin",
                iconSize: 0.1,
              }}
            />
          </ShapeSource>
        )}

        {trip.end_coords && (
          <ShapeSource id="start-location" shape={featureCollection([point(trip.end_coords)])}>
            <SymbolLayer
              id="start-location-icon"
              style={{
                iconImage: "pin",
                iconSize: 0.1,
              }}
            />
          </ShapeSource>
        )}

        {coordinates && (
          <ShapeSource id="todas" shape={featureCollection([point(coordinates)])}>
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
