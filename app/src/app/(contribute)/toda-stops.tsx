import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Platform } from "react-native";

import LocationSearchBar from "@components/LocationSearchBar";
import Header from "@components/ui/Header";
import TodaInformation from "@components/contribute/TodaInformation";
import TodaMarker from "@components/map/TodaMarker";
import pin from "@assets/pin-purple.png";

import { useMapView } from "@hooks/use-map-view";

import Mapbox, {
  MapView,
  ShapeSource,
  SymbolLayer,
  Images,
  UserLocation,
  Camera,
} from "@rnmapbox/maps";
import { featureCollection, point } from "@turf/helpers";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
import { fetchStops } from "@services/toda-stop-service";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function TodaStops() {
  const {
    cameraRef,
    coordinates,
    zoomLevel,
    handleMapPress,
    centerMap,
    handleUserLocation,
    userCoords,
  } = useMapView(12);

  const [stops, setStops] = useState<StopData[]>([]);

  const loadStops = async () => {
    const result = await fetchStops();
    if (result) setStops(result);
  };

  useEffect(() => {
    loadStops();
  }, []);

  const handleSuggestionSelect = (longitude: number, latitude: number) => {
    const newCoordinates: [number, number] = [longitude, latitude];
    centerMap(newCoordinates, 15);
  };

  const handleClear = () => {
    centerMap(userCoords, 12);
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
          centerCoordinate={coordinates || userCoords || [121.0303, 14.6563]}
          zoomLevel={zoomLevel}
          animationMode={Platform.OS === "android" ? "none" : "easeTo"}
        />

        <UserLocation
          visible={true}
          onUpdate={(location) => {
            handleUserLocation(location);
          }}
        />

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
      </MapView>

      <TodaInformation coordinates={coordinates} onNewStopAdded={loadStops} />
    </SafeAreaView>
  );
}
