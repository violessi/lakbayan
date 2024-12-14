import React, { useRef, useState, useEffect, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, View, Text } from "react-native";
import { Button } from "react-native-paper";
import Header from "@/components/ui/Header";
import RouteInformation from "@/components/contribute/RouteInformation";

import { getDirections } from "@/services/mapbox-service";
import { Coordinates } from "@/types/location-types";

import Mapbox, {
  MapView,
  Camera,
  ShapeSource,
  CircleLayer,
  SymbolLayer,
  LineLayer,
} from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox-config";
import { point } from "@turf/helpers";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteInput() {
  const cameraRef = useRef<Camera>(null);
  const [directions, setDirections] = useState<any | null>(null);
  const directionCoordinates = directions?.routes?.[0]?.geometry.coordinates;

  const {
    startRouteLocationParams,
    startRouteCoordinatesParams,
    endRouteLocationParams,
    endRouteCoordinatesParams,
    transportationModeParams,
  } = useLocalSearchParams();

  const startRouteLocation = startRouteLocationParams as string;
  const endRouteLocation = endRouteLocationParams as string;

  const startRouteCoordinates: Coordinates = JSON.parse(
    startRouteCoordinatesParams as string,
  );
  const endRouteCoordinates: Coordinates = JSON.parse(
    endRouteCoordinatesParams as string,
  );

  const transportationMode = transportationModeParams as string;

  const startPoint = point(startRouteCoordinates);
  const endPoint = point(endRouteCoordinates);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [
          (startRouteCoordinates[0] + endRouteCoordinates[0]) / 2,
          (startRouteCoordinates[1] + endRouteCoordinates[1]) / 2,
        ],
        zoomLevel: 12,
        animationDuration: 1000,
      });
    }
  }, [startRouteCoordinates, endRouteCoordinates]);

  const handleGetDirections = useCallback(async () => {
    try {
      const newDirections = await getDirections(
        startRouteCoordinates,
        endRouteCoordinates,
      );
      setDirections(newDirections);
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  }, [startRouteCoordinates, endRouteCoordinates]);

  useEffect(() => {
    handleGetDirections();
  }, [handleGetDirections]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" />
      <View>
        <Text>
          {startRouteLocation} to {endRouteLocation} via {transportationMode}
        </Text>
      </View>
      <Button mode="contained" onPress={handleGetDirections}>
        Get Directions
      </Button>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={[
            (startRouteCoordinates[0] + endRouteCoordinates[0]) / 2,
            (startRouteCoordinates[1] + endRouteCoordinates[1]) / 2,
          ]}
          zoomLevel={12}
          animationMode="easeTo"
        />

        <ShapeSource id="start-point" shape={startPoint}>
          <CircleLayer
            id="start-circle"
            style={{
              circleRadius: 8,
              circleColor: "red",
            }}
          />
          <SymbolLayer
            id="start-label"
            style={{
              textField: startRouteLocation.split(",")[0],
              textSize: 11,
              textOffset: [0, 1.5],
            }}
          />
        </ShapeSource>

        <ShapeSource id="end-point" shape={endPoint}>
          <CircleLayer
            id="end-circle"
            style={{
              circleRadius: 8,
              circleColor: "red",
            }}
          />
          <SymbolLayer
            id="end-label"
            style={{
              textField: endRouteLocation.split(",")[0],
              textSize: 11,
              textOffset: [0, 1.5],
            }}
          />
        </ShapeSource>

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
            <LineLayer
              id="directions-line"
              style={{ lineColor: "red", lineWidth: 3 }}
            />
          </ShapeSource>
        )}
      </MapView>
      <RouteInformation />
    </SafeAreaView>
  );
}
