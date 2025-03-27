import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, SafeAreaView, View } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import Header from "@components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import DirectionsLine from "@components/ui/DirectionsLine";
import CircleMarker from "@components/map/CircleMarker";
import TripTitle from "@components/contribute/TripTitle";
import RouteInformation from "@components/contribute/RouteInformation";

import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";
import { getDirections, paraphraseStep } from "@services/mapbox-service";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteInput() {
  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(13);

  const { route, updateRoute, addSegment } = useTripCreator();
  const [customWaypoints, setCustomWaypoint] = useState<Coordinates[]>([]);
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const getRouteDirections = async () => {
    setIsLoadingRoute(true);
    try {
      const data = await getDirections(
        route.startCoords,
        customWaypoints,
        route.endCoords,
        route.segmentMode,
        true,
      );

      const directions = data.routes[0];
      const waypoints = directions.geometry.coordinates ?? [];
      const duration = directions.duration;
      const distance = directions.distance;
      const navigationSteps = directions.legs.flatMap(({ steps }) =>
        steps.map(({ maneuver }) => ({
          instruction: paraphraseStep(maneuver.instruction),
          location: maneuver.location,
        })),
      );
      updateRoute({ waypoints, duration, distance, navigationSteps });
    } catch (error) {
      console.error("Error fetching directions:", error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleMapClick = async (event: any) => {
    if (!isEditingRoute) return;
    setCustomWaypoint((prev) => [...prev, event.geometry.coordinates]);
  };

  const handleToggleMode = async () => {
    if (isEditingRoute) await getRouteDirections();
    setIsEditingRoute((prev) => !prev);
  };

  const handleSubmit = () => {
    if (!route.segmentName || !route.cost || isNaN(route.cost) || route.waypoints.length === 0) {
      Alert.alert("Please fill in all fields to proceed.");
      return;
    }
    addSegment();
    router.push("/(contribute)/2-review-trip");
  };

  const clearWaypoints = () => setCustomWaypoint([]);
  const handleZoomChange = (event: any) => setZoomLevel(event.properties.zoom);
  const handleMapLoaded = () => {
    if (cameraRef.current) {
      cameraRef.current.fitBounds(route.startCoords, route.endCoords, [150, 150, 250, 150]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" />
      <View className="flex justify-center items-center">
        <TripTitle
          startLocation={route.startLocation}
          endLocation={route.endLocation}
          transportationMode={route.segmentMode}
        />
      </View>

      <MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/streets-v12"
        projection="mercator"
        onRegionDidChange={handleZoomChange}
        onDidFinishLoadingMap={handleMapLoaded}
        onPress={handleMapClick}
      >
        <Camera ref={cameraRef} zoomLevel={zoomLevel} animationMode="easeTo" />

        <CircleMarker
          id="start-location"
          coordinates={route.startCoords}
          label={route.startLocation}
          color="red"
        />
        <CircleMarker
          id="end-location"
          coordinates={route.endCoords}
          label={route.endLocation}
          color="red"
        />

        {customWaypoints.map((waypoint, index) => (
          <CircleMarker
            key={`waypoint-${index}`}
            id={`waypoint-${index}`}
            coordinates={waypoint}
            label={`Waypoint ${index + 1}`}
            color="blue"
            radius={6}
          />
        ))}

        {!isLoadingRoute && !isEditingRoute && route.waypoints.length > 0 && (
          <DirectionsLine coordinates={route.waypoints} />
        )}
      </MapView>

      <View className="absolute bottom-96 w-full flex flex-col gap-4">
        <View className="flex-row z-10">
          <View className="flex-1 pl-3 pr-[5px]">
            <PrimaryButton
              label={isEditingRoute ? "Recalculate" : "Edit Route"}
              onPress={handleToggleMode}
            />
          </View>
          <View className="flex-1 pr-3 pl-[5px]">
            <PrimaryButton
              label={isEditingRoute ? "Clear" : "Calculate"}
              onPress={isEditingRoute ? clearWaypoints : getRouteDirections}
            />
          </View>
        </View>
      </View>

      <RouteInformation
        onRouteNameChange={(segmentName) => updateRoute({ segmentName })}
        onLandmarkChange={(landmark) => updateRoute({ landmark })}
        onInstructionChange={(instruction) => updateRoute({ instruction })}
        onCostChange={(cost) => updateRoute({ cost: Number(cost) })}
        routeName={route.segmentName}
        landmark={route.landmark}
        instruction={route.instruction}
        cost={route.cost.toString()}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
