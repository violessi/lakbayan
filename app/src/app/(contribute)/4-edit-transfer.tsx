import { router } from "expo-router";
import ButtomSheet from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Alert, SafeAreaView, View, BackHandler } from "react-native";

import Header from "@components/ui/Header";
import TripTitle from "@components/contribute/TripTitle";
import { MapShell } from "@components/map/MapShell";
import CircleMarker from "@components/map/CircleMarker";
import SymbolMarker from "@components/map/SymbolMarker";
import PrimaryButton from "@components/ui/PrimaryButton";
import DirectionLine from "@components/map/DirectionLine";
import DirectionLines from "@components/map/DirectionLines";
import RouteInformation from "@components/contribute/RouteInformation";
import UnsavedChangesAlert from "@components/contribute/UnsavedChangesAlert";

import { RouteInputSchema } from "@schemas";
import { useMapView } from "@hooks/use-map-view";
import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";
import { TRANSPORTATION_COLORS as COLORS } from "@constants/transportation-color";

export default function RouteInput() {
  const buttomSheetRef = useRef<ButtomSheet>(null);

  const {
    trip,
    route,
    segments,
    editingIndex,
    customWaypoints,
    setCustomWaypoint,
    setEditingIndex,
    updateRoute,
    createRoute,
    addSegment,
    clearRouteData,
  } = useTripCreator();
  const { cameraRef, zoomLevel, center, handleMapPress } = useMapView();
  const [isEditingWaypoint, setIsEditingWaypoints] = useState(false);

  const handleMapClick = async (feature: any) => {
    if (!isEditingWaypoint) return;
    setCustomWaypoint((prev) => [...prev, feature.geometry.coordinates]);
    handleMapPress(feature);
  };

  const handleCompleteEditing = () => {
    setIsEditingWaypoints(false);
    buttomSheetRef.current?.expand();
  };

  const handleProcessRoute = async () => {
    try {
      await createRoute(customWaypoints);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to process route");
    }
  };

  const handleResetWaypoints = () => {
    setCustomWaypoint([]);
    updateRoute({ ...route, duration: 0, distance: 0, waypoints: [], navigationSteps: [] });
  };

  // NOTE: handle custom error msg at schema
  const handleSubmit = () => {
    const result = RouteInputSchema.safeParse(route);
    if (!result.success) {
      Alert.alert("Error", result.error.errors[0].message);
      return;
    }

    addSegment();
    router.replace("/(contribute)/2-review-trip");
  };

  // ==================== App Navigation ==================== //

  const handleBackNavigation = () => {
    clearRouteData();
    setEditingIndex(-1);
    if (editingIndex === -1) router.replace("/(contribute)/3-add-transfer");
    else router.replace("/(contribute)/2-review-trip");
  };

  const prevCallback = () => {
    UnsavedChangesAlert(handleBackNavigation);
  };

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      UnsavedChangesAlert(handleBackNavigation);
      return true;
    });
    return () => backHandler.remove();
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Route Input" prevCallback={prevCallback} />
      <View className="flex justify-center items-center">
        <TripTitle
          startLocation={route.startLocation}
          endLocation={route.endLocation}
          transportationMode={route.segmentMode}
        />
      </View>

      <MapShell
        center={center}
        zoomLevel={zoomLevel}
        cameraRef={cameraRef}
        handleMapPress={handleMapClick}
        fitBounds={[route.startCoords, route.endCoords]}
      >
        <DirectionLines coordinates={segments.map((segment) => segment.waypoints)} />
        <DirectionLine coordinates={route.waypoints} color={COLORS[segments.length]} />

        <SymbolMarker id="trip-start" label={trip.startLocation} coordinates={trip.startCoords} />
        <SymbolMarker id="trip-end" label={trip.endLocation} coordinates={trip.endCoords} />

        {trip.endLocation !== route.endLocation && (
          <CircleMarker
            id="route-end-loc"
            coordinates={route.endCoords}
            label={route.endLocation}
            color={COLORS[segments.length]}
          />
        )}

        {customWaypoints.map((waypoint, index) => (
          <CircleMarker
            key={`waypoint-${index}`}
            id={`waypoint-${index}`}
            coordinates={waypoint}
            label={`Waypoint ${index + 1}`}
          />
        ))}
      </MapShell>

      <View className="absolute bottom-0 z-50 w-full px-10 pb-12">
        {isEditingWaypoint && (
          <View className="flex flex-row w-full justify-between">
            <PrimaryButton label="Done" onPress={handleCompleteEditing} />
            <PrimaryButton label="Calculate" onPress={handleProcessRoute} />
            <PrimaryButton label="Clear" onPress={handleResetWaypoints} />
          </View>
        )}
      </View>

      <RouteInformation
        sheetRef={buttomSheetRef}
        handleSubmit={handleSubmit}
        setIsEditingWaypoints={setIsEditingWaypoints}
      />
    </SafeAreaView>
  );
}
