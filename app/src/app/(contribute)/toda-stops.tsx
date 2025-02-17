import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, View } from "react-native";

import LocationSearchBar from "../../components/LocationSearchBar";
import Header from "../../components/ui/Header";
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

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchStops();
      if (result) {
        setStops(result);
      }
    };
    fetchData();
  }, []);

  const handleMapPress = (event: any) => {
    const { geometry } = event;
    const { coordinates } = geometry;
    setCoordinates(coordinates);
    setZoomLevel(16);
  };

  const handleSuggestionSelect = (longitude: number, latitude: number) => {
    const newCoordinates: [number, number] = [longitude, latitude];
    setCoordinates(newCoordinates);
  };

  const handleZoomChange = (event: any) => {
    console.log(event.properties);
    const { zoom } = event.properties;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Pin Toda Stops" />

      <View>
        <LocationSearchBar onSuggestionSelect={handleSuggestionSelect} onClear={() => setCoordinates(null)} />
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
            coordinates={[stop.longitude, stop.latitude]}
            label={stop.name}
            color={stop.color}
            radius={8}
          />
        ))}

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

      <TodaInformation coordinates={coordinates} />
    </SafeAreaView>
  );
}
