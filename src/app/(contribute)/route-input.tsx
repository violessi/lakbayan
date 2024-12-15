import React, { useRef, useState } from "react";
import { useTrip } from "@contexts/TripContext";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView, View } from "react-native";
import { Button } from "react-native-paper";
import uuid from "react-native-uuid";

import Header from "@components/ui/Header";
import TripTitle from "@components/contribute/TripTitle";
import RouteInformation from "@components/contribute/RouteInformation";
import LocationMarker from "@components/ui/LocationMarker";
import DirectionsLine from "@components/ui/DirectionsLine";

import { getDirections } from "@services/mapbox-service";

import Mapbox, { MapView, Camera, ShapeSource, LineLayer } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteInput() {
  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [directions, setDirections] = useState<MapboxDirectionsResponse | null>(null);
  const [waypoints, setWaypoints] = useState<Coordinates[]>([]);

  const [isAddPointsMode, setIsAddPointsMode] = useState(false);
  const [loadingDirections, setLoadingDirections] = useState(false);

  const [routeName, setRouteName] = useState("");
  const [landmark, setLandmark] = useState("");

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

  const directionCoordinates: Coordinates[] = directions?.routes?.[0]?.geometry.coordinates || [];

  const handleGetDirections = async () => {
    setLoadingDirections(true);
    try {
      const newDirections = await getDirections(
        startRouteCoordinates,
        waypoints,
        endRouteCoordinates,
        transportationMode,
      );
      setDirections(newDirections);
    } catch (error) {
      console.error("Error fetching directions:", error);
    } finally {
      setLoadingDirections(false);
    }
  };

  const handleZoomChange = (event: any) => {
    const { zoom } = event.properties;
    setZoomLevel(zoom);
  };

  const handleMapClick = async (event: any) => {
    if (!isAddPointsMode) return;
    const { geometry } = event;
    const newPoint: Coordinates = geometry.coordinates;
    setWaypoints((prev) => [...prev, newPoint]);
    console.log("Added Waypoint:", newPoint);
  };

  const clearWaypoints = () => {
    setWaypoints([]);
  };

  const handleToggleMode = async () => {
    setIsAddPointsMode((prev) => !prev);
    if (isAddPointsMode) {
      await handleGetDirections();
    }
  };

  const handleRouteNameChange = (routeName: string) => {
    setRouteName(routeName);
  };

  const handleLandmarkChange = (landmark: string) => {
    setLandmark(landmark);
  };

  const { addRoute } = useTrip();

  const handleSubmit = () => {
    if (!directions) {
      console.log("Error: Directions are required.");
      return;
    }

    const newRoute: Route = {
      id: uuid.v4(),
      routeName,
      landmark,
      startLocation: startRouteLocation,
      startCoordinates: startRouteCoordinates,
      endLocation: endRouteLocation,
      endCoordinates: endRouteCoordinates,
      directions: directions,
      transportationMode: transportationMode,
    };

    addRoute(newRoute);
    console.log("Added Route:", newRoute);
    router.dismissAll();
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

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onRegionDidChange={handleZoomChange}
        onPress={handleMapClick}
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

        <LocationMarker coordinates={startRouteCoordinates} label={startRouteLocation} color={"red"} radius={8} />
        <LocationMarker coordinates={endRouteCoordinates} label={endRouteLocation} color={"red"} radius={8} />

        {waypoints.map((waypoint, index) => (
          <LocationMarker
            key={`waypoint-${index}`}
            coordinates={waypoint}
            label={`Waypoint ${index + 1}`}
            color={"blue"}
            radius={6}
          />
        ))}

        {!loadingDirections && directionCoordinates && !isAddPointsMode && (
          <DirectionsLine coordinates={directionCoordinates} />
        )}
      </MapView>

      <View className="absolute bottom-0 mb-72 w-100">
        <View className="flex flex-row">
          <View className="w-1/2 pl-12 pr-5">
            <Button mode="contained" onPress={handleToggleMode}>
              {isAddPointsMode ? "Recalculate Route" : "Edit route"}
            </Button>
          </View>

          <View className="w-1/2 pr-12 pl-5">
            {isAddPointsMode && (
              <Button mode="contained" onPress={clearWaypoints}>
                Clear Waypoints
              </Button>
            )}

            {!isAddPointsMode && (
              <Button mode="contained" onPress={handleGetDirections}>
                Calculate Route
              </Button>
            )}
          </View>
        </View>
      </View>

      <RouteInformation
        onRouteNameChange={handleRouteNameChange}
        onLandmarkChange={handleLandmarkChange}
        routeName={routeName}
        landmark={landmark}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
