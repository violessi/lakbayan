import { router } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import React, { useRef, useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Alert, SafeAreaView, View, BackHandler } from "react-native";

import Header from "@components/ui/Header";
import LineSource from "@components/map/LineSource";
import { MapShell } from "@components/map/MapShell";
import CircleSource from "@components/map/CircleSource";
import SymbolMarker from "@components/map/SymbolMarker";
import TripTitle from "@components/contribute/TripTitle";
import PrimaryButton from "@components/ui/PrimaryButton";
import PrimaryButtonOutline from "@components/ui/PrimaryButtonOutline";
import RouteInformation from "@components/contribute/RouteInformation";
import UnsavedChangesAlert from "@components/contribute/UnsavedChangesAlert";

import { RouteInputSchema } from "@schemas";
import { useMapView } from "@hooks/use-map-view";
import { useTripCreator } from "@contexts/TripCreator";
import { TRANSPORTATION_COLORS as COLORS } from "@constants/transportation-color";

export default function RouteInput() {
  const bottomSheetRef = useRef<BottomSheet>(null);

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
  const { cameraRef, setCoordinates } = useMapView();
  const [isEditingWaypoint, setIsEditingWaypoints] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Calculate route on initial load for better UX
  useEffect(() => {
    if (!isEditingWaypoint && customWaypoints.length === 0) {
      handleProcessRoute();
    }
  }, []);

  // Calculate route when segment mode changes for better UX
  useEffect(() => {
    handleProcessRoute();
  }, [route.segmentMode]);

  const handleMapClick = async (feature: any) => {
    if (!isEditingWaypoint) return;
    setCustomWaypoint((prev) => [...prev, feature.geometry.coordinates]);
    if (!feature.geometry || feature.geometry.type !== "Point") return;
    const coordinates = feature.geometry.coordinates as Coordinates;
    setCoordinates(coordinates);
  };

  const handleCompleteEditing = () => {
    setIsEditingWaypoints(false);
    bottomSheetRef.current?.expand();
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
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = RouteInputSchema.safeParse(route);
    if (!result.success) {
      Alert.alert("Error", result.error.errors[0].message);
      setSubmitting(false);
      return;
    }
    try {
      await addSegment();
      clearRouteData();
      setCustomWaypoint([]);
      router.replace("/(contribute)/2-review-trip");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
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
        cameraRef={cameraRef}
        handleMapPress={handleMapClick}
        fitBounds={[route.startCoords, route.endCoords]}
      >
        <LineSource id="segments" data={segments} lineWidth={3} />
        <LineSource id="route" data={[route]} lineWidth={3} colors={[COLORS[segments.length]]} />

        <CircleSource id="waypoints" data={customWaypoints} />
        <SymbolMarker id="start-loc" label="Start" coordinates={trip.startCoords} />
        <SymbolMarker id="end-loc" label="Destination" coordinates={trip.endCoords} />
        {trip.endLocation !== route.endLocation && (
          <SymbolMarker id="next-loc" coordinates={route.endCoords} label="Next Transfer" />
        )}
      </MapShell>

      <View className="absolute bottom-0 z-50 w-full px-10 pb-12">
        {isEditingWaypoint && (
          <View className="flex flex-col w-full justify-between gap-5">
            <View className="flex flex-row justify-center gap-5">
              <PrimaryButtonOutline onPress={handleProcessRoute}>Calculate</PrimaryButtonOutline>
              <PrimaryButtonOutline onPress={handleResetWaypoints}>Clear</PrimaryButtonOutline>
            </View>
            <PrimaryButton label="Done" onPress={handleCompleteEditing} />
          </View>
        )}
      </View>

      <RouteInformation
        sheetRef={bottomSheetRef}
        handleSubmit={handleSubmit}
        setIsEditingWaypoints={setIsEditingWaypoints}
      />
    </SafeAreaView>
  );
}
