import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { SafeAreaView, View } from "react-native";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

import Header from "@components/ui/Header";
import PrimaryButton from "@components/ui/PrimaryButton";
import DirectionsLine from "@components/ui/DirectionsLine";
import CircleMarker from "@components/map/CircleMarker";
import TripTitle from "@components/contribute/TripTitle";
import RouteInformation from "@components/contribute/RouteInformation";

import { useSession } from "@contexts/SessionContext";
import { useCreateTrip } from "@contexts/CreateTripContext";
import { getDirections } from "@services/mapbox-service";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteInput() {
  const { user } = useSession();
  const { route, addSegment } = useCreateTrip();

  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(18);
  const [directions, setDirections] = useState<MapboxDirectionsResponse | null>(null);
  const [waypoints, setWaypoints] = useState<Coordinates[]>([]);

  const [isAddPointsMode, setIsAddPointsMode] = useState(false);
  const [loadingDirections, setLoadingDirections] = useState(false);

  // TODO: move this to route variable inside the useCreateTrip context
  const [segmentName, setSegmentName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instruction, setInstruction] = useState("");
  const [cost, setCost] = useState("");

  const directionCoordinates: Coordinates[] = directions?.routes?.[0]?.geometry.coordinates || [];

  const handleGetDirections = async () => {
    setLoadingDirections(true);
    try {
      const newDirections = await getDirections(route.startCoords, waypoints, route.endCoords, route.segmentMode);
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

  const handleRouteNameChange = (name: string) => {
    setSegmentName(name);
  };

  const handleLandmarkChange = (lm: string) => {
    setLandmark(lm);
  };

  const handleInstructionChange = (instr: string) => {
    setInstruction(instr);
  };

  const handleCostChange = (c: string) => {
    setCost(c);
  };

  const handleSubmit = () => {
    if (!directions) {
      console.log("Error: Directions are required.");
      return;
    }

    // TODO: move this to context
    const newSegment: CreateSegmentV2 = {
      contributorId: user!.id,
      segmentName: segmentName,
      segmentMode: route.segmentMode,
      landmark: landmark,
      instruction: instruction,
      gpsVerified: 0,
      modVerified: 0,
      duration: directions.routes[0].duration,
      cost: Number(cost) || 0,
      liveStatus: [],
      waypoints: waypoints,
      directions: directions,
      startLocation: route.startLocation,
      startCoords: route.startCoords,
      endLocation: route.endLocation,
      endCoords: route.endCoords,
    };

    addSegment(newSegment);
    console.log("Added Segment:", newSegment);
    router.push("/(contribute)/trip-review");
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
        onPress={handleMapClick}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={[
            (route.startCoords[0] + route.endCoords[0]) / 2,
            (route.startCoords[1] + route.endCoords[1]) / 2,
          ]}
          zoomLevel={zoomLevel}
          animationMode="easeTo"
        />

        <CircleMarker id="start-location" coordinates={route.startCoords} label={route.startLocation} color="red" />
        <CircleMarker id="end-location" coordinates={route.endCoords} label={route.endLocation} color="red" />

        {waypoints.map((waypoint, index) => (
          <CircleMarker
            key={`waypoint-${index}`}
            id={`waypoint-${index}`}
            coordinates={waypoint}
            label={`Waypoint ${index + 1}`}
            color="blue"
            radius={6}
          />
        ))}

        {!loadingDirections && directionCoordinates.length > 0 && !isAddPointsMode && (
          <DirectionsLine coordinates={directionCoordinates} />
        )}
      </MapView>

      <View className="absolute bottom-96 w-full flex flex-col gap-4">
        <View className="flex-row z-10">
          <View className="flex-1 pl-3 pr-[5px]">
            <PrimaryButton label={isAddPointsMode ? "Recalculate" : "Edit Route"} onPress={handleToggleMode} />
          </View>

          <View className="flex-1 pr-3 pl-[5px]">
            {isAddPointsMode ? (
              <PrimaryButton label="Clear" onPress={clearWaypoints} />
            ) : (
              <PrimaryButton label="Calculate" onPress={handleGetDirections} />
            )}
          </View>
        </View>
      </View>
      <RouteInformation
        onRouteNameChange={handleRouteNameChange}
        onLandmarkChange={handleLandmarkChange}
        onInstructionChange={handleInstructionChange}
        onCostChange={handleCostChange}
        routeName={segmentName}
        landmark={landmark}
        instruction={instruction}
        cost={cost}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
