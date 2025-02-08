import React, { useRef, useState } from "react";
import { useTrip } from "@contexts/TripContext";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView, View } from "react-native";
import uuid from "react-native-uuid";

import Header from "@components/ui/Header";
import TripTitle from "@components/contribute/TripTitle";
import RouteInformation from "@components/contribute/RouteInformation";
import LocationMarker from "@components/ui/LocationMarker";
import DirectionsLine from "@components/ui/DirectionsLine";
import PrimaryButton from "@components/ui/PrimaryButton";

import { getDirections } from "@services/mapbox-service";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteInput() {
  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [directions, setDirections] = useState<MapboxDirectionsResponse | null>(null);
  const [waypoints, setWaypoints] = useState<Coordinates[]>([]);

  const [isAddPointsMode, setIsAddPointsMode] = useState(false);
  const [loadingDirections, setLoadingDirections] = useState(false);

  const [segmentName, setSegmentName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instruction, setInstruction] = useState("");
  const [cost, setCost] = useState("");

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

  const transportationMode = transportationModeParams as TransportationMode;

  const directionCoordinates: Coordinates[] =
    directions?.routes?.[0]?.geometry.coordinates || [];

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

  const { addSegment, setStartEndLocations, trip } = useTrip();

  const handleSubmit = () => {
    if (!directions) {
      console.log("Error: Directions are required.");
      return;
    }

    const newSegment: Segment = {
      id: uuid.v4(),
      contributor_id: "",
      segment_name: segmentName,
      segment_mode: transportationMode,
      directions: directions,
      waypoints: waypoints,
      landmark: landmark,
      instruction: instruction,
      last_updated: new Date(),
      gps_verified: 0,
      mod_verified: 0,
      start_location: startRouteLocation,
      start_coords: startRouteCoordinates,
      end_location: endRouteLocation,
      end_coords: endRouteCoordinates,
      duration: directions.routes[0].duration,
      cost: Number(cost) || 0,
    };

    addSegment(newSegment);
    console.log("Added Segment:", newSegment);
    router.replace({
      pathname: "/trip-review",
      params: {},
    });
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

        <LocationMarker
          coordinates={startRouteCoordinates}
          label={startRouteLocation}
          color="red"
          radius={8}
        />
        <LocationMarker
          coordinates={endRouteCoordinates}
          label={endRouteLocation}
          color="red"
          radius={8}
        />

        {waypoints.map((waypoint, index) => (
          <LocationMarker
            key={`waypoint-${index}`}
            coordinates={waypoint}
            label={`Waypoint ${index + 1}`}
            color="blue"
            radius={6}
          />
        ))}

        {!loadingDirections &&
          directionCoordinates.length > 0 &&
          !isAddPointsMode && (
            <DirectionsLine coordinates={directionCoordinates} />
          )}
      </MapView>

      <View className="absolute bottom-96 w-full flex flex-col gap-4">
        <View className="flex-row z-10">
          <View className="flex-1 pl-3 pr-[5px]">
            <PrimaryButton
              label={isAddPointsMode ? "Recalculate" : "Edit Route"}
              onPress={handleToggleMode}
            />
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
