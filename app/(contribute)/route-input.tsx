import React, { useRef, useState, useEffect, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, View, Text } from "react-native";
import { Button } from "react-native-paper";

import Header from "@/components/ui/Header";
import TripTitle from "@/components/contribute/TripTitle";
import RouteInformation from "@/components/contribute/RouteInformation";
import LocationMarker from "@/components/ui/LocationMarker";

import { getDirections } from "@/services/mapbox-service";
import { Coordinates } from "@/types/location-types";

import Mapbox, { MapView, Camera, ShapeSource, CircleLayer, SymbolLayer, LineLayer } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";
import { point } from "@turf/helpers";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteInput() {
  const cameraRef = useRef<Camera>(null);
  const [directions, setDirections] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const directionCoordinates: Coordinates[] = directions?.routes?.[0]?.geometry.coordinates || [];

  const {
    startRouteLocationParams,
    startRouteCoordinatesParams,
    endRouteLocationParams,
    endRouteCoordinatesParams,
    transportationModeParams,
  } = useLocalSearchParams();

  const startRouteLocation = startRouteLocationParams as string;
  const endRouteLocation = endRouteLocationParams as string;

  const startRouteCoordinates: Coordinates = JSON.parse(startRouteCoordinatesParams as string);
  const endRouteCoordinates: Coordinates = JSON.parse(endRouteCoordinatesParams as string);

  const transportationMode = transportationModeParams as string;

  const handleGetDirections = useCallback(async () => {
    try {
      const newDirections = await getDirections(startRouteCoordinates, endRouteCoordinates);
      setDirections(newDirections);
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  }, [startRouteCoordinates, endRouteCoordinates]);

  useEffect(() => {
    handleGetDirections();
  }, [handleGetDirections]);

  const handleZoomChange = (event: any) => {
    const { zoom } = event.properties;
    setZoomLevel(zoom);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" />
      <View className="flex justify-center items-center">
        <TripTitle
          startLocation={startRouteLocation}
          endLocation={endRouteLocation}
          transportationMode={transportationMode}
        />
      </View>
      {/* <View>
        <Button mode="contained" onPress={handleGetDirections}>
          Update
        </Button>
      </View> */}

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onRegionDidChange={handleZoomChange}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={[
            (startRouteCoordinates[0] + endRouteCoordinates[0]) / 2,
            (startRouteCoordinates[1] + endRouteCoordinates[1]) / 2,
          ]}
          zoomLevel={zoomLevel}
          animationMode="easeTo"
        />

        <LocationMarker coordinates={startRouteCoordinates} label={startRouteLocation} />
        <LocationMarker coordinates={endRouteCoordinates} label={endRouteLocation} />

        {directionCoordinates && (
          <ShapeSource
            id="directions"
            shape={{
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: directionCoordinates,
                  },
                  properties: {},
                },
              ],
            }}
          >
            <LineLayer id="directions-line" style={{ lineColor: "red", lineWidth: 3 }} />
          </ShapeSource>
        )}
      </MapView>
      <RouteInformation />
    </SafeAreaView>
  );
}
