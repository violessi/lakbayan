import React, { useState, useEffect } from "react";
import { SafeAreaView, View } from "react-native";

import LocationSearchBar from "@components/LocationSearchBar";
import Header from "@components/ui/Header";
import TodaInformation from "@components/contribute/TodaInformation";
import TodaMarker from "@components/map/TodaMarker";
import pin from "@assets/pin-purple.png";

import { MapShell } from "@components/map/MapShell";

import { useMapView } from "@hooks/use-map-view";

import Mapbox, { ShapeSource, SymbolLayer, Images } from "@rnmapbox/maps";
import { featureCollection, point } from "@turf/helpers";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { fetchStops } from "@services/toda-stop-service";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

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

  const loadStops = async () => {
    const result = await fetchStops();
    if (result) setStops(result);
  };

  useEffect(() => {
    loadStops();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Pin Toda Stops" />

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
      <TodaInformation coordinates={coordinates} onNewStopAdded={loadStops} />
    </SafeAreaView>
  );
}
