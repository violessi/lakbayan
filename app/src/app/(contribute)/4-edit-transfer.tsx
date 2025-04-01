import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Mapbox, { MapView, Camera } from "@rnmapbox/maps";
import { Alert, SafeAreaView, View, BackHandler } from "react-native";
import React, { useRef, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import Header from "@components/ui/Header";
import CircleMarker from "@components/map/CircleMarker";
import TripTitle from "@components/contribute/TripTitle";
import PrimaryButton from "@components/ui/PrimaryButton";
import DirectionsLine from "@components/ui/DirectionsLine";
import RouteInformation from "@components/contribute/RouteInformation";

import { useTripCreator } from "@contexts/TripCreator/TripCreatorContext";
import { getDirections, paraphraseStep } from "@services/mapbox-service";

import { MAPBOX_ACCESS_TOKEN } from "@utils/mapbox-config";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function RouteInput() {
  const cameraRef = useRef<Camera>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [zoomLevel, setZoomLevel] = useState(13);

  const { route, inEditMode, setInEditMode, updateRoute, addSegment, clearRouteData } =
    useTripCreator();
  const [customWaypoints, setCustomWaypoint] = useState<Coordinates[]>([]);
  const [isAddingWaypoints, setIsAddingWaypoints] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const { index } = useLocalSearchParams<{ index: string }>();
  const segmentIndex = index !== undefined && index !== null ? parseInt(String(index), 10) : -1;

  const getRouteDirections = async () => {
    handleDismissPress();
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
    if (!isAddingWaypoints) return;
    setCustomWaypoint((prev) => [...prev, event.geometry.coordinates]);
  };

  const handleToggleMode = async () => {
    handleDismissPress();
    if (isAddingWaypoints) await getRouteDirections();
    if (!isAddingWaypoints) setIsAddingWaypoints((prev) => !prev);
  };

  const handleDoneAddingWaypoint = () => {
    setIsAddingWaypoints((prev) => !prev);
  }

  const handleDismissPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const handleSubmit = () => {
    if (
      !route.segmentMode ||
      !route.segmentName ||
      !route.cost ||
      isNaN(route.cost) ||
      route.waypoints.length === 0
    ) {
      Alert.alert("Please fill in all fields to proceed.");
      return;
    }
    handleDismissPress();
    addSegment(segmentIndex);
    router.replace("/(contribute)/2-review-trip");
  };

  const clearWaypoints = () => {
    setCustomWaypoint([])
    updateRoute({
      ...route,
      waypoints: [],
      duration: 0,
      distance: 0,
      navigationSteps: []
    });
  };
  const handleZoomChange = (event: any) => setZoomLevel(event.properties.zoom);
  const handleMapLoaded = () => {
    if (cameraRef.current) {
      cameraRef.current.fitBounds(route.startCoords, route.endCoords, [150, 150, 250, 150]);
    }
  };

  // bottom sheet
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current!.present();
  }, []);

  const prevCallback = () => {
    Alert.alert(
      "Unsaved Changes",
      "You have unsaved changes. If you leave now, your progress will be lost. Do you want to continue?",
      [
        {
          text: "Leave Anyway",
          style: "destructive",
          onPress: () => {
            clearRouteData();
            if (inEditMode) {
              setInEditMode(false);
              router.replace("/(contribute)/2-review-trip");
            } else {
              router.replace("/(contribute)/3-add-transfer");
            }
          },
        },
        { text: "Stay", style: "cancel" },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert(
          "Unsaved Changes",
          "You have unsaved changes. If you leave now, your progress will be lost. Do you want to continue?",
          [
            {
              text: "Leave Anyway",
              style: "destructive",
              onPress: () => {
                clearRouteData();
                if (inEditMode) {
                  setInEditMode(false);
                  router.replace("/(contribute)/2-review-trip");
                } else {
                  router.replace("/(contribute)/3-add-transfer");
                }
              },
            },
            { text: "Stay", style: "cancel" },
          ]
        );
  
        return true; // Prevents default back button behavior
      };
  
      // Add event listener
      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
  
      return () => backHandler.remove(); // Cleanup when screen loses focus
    }, [inEditMode]) // Re-run if `inEditMode` changes
  );

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

        {!isLoadingRoute && route.waypoints.length > 0 && (
          <DirectionsLine coordinates={route.waypoints} />
        )}
      </MapView>

      <View className="absolute bottom-0 z-50 flex flex-row gap-2 p-5 w-full justify-center">
        <PrimaryButton 
          label={isAddingWaypoints ? "Recalculate" : "Edit Details"}
          onPress={isAddingWaypoints? handleToggleMode: handlePresentModalPress} 
        />
        <PrimaryButton 
          label={isAddingWaypoints ? "Clear" : "Submit"} 
          onPress={isAddingWaypoints? clearWaypoints: handleSubmit} />
        {isAddingWaypoints && (
          <PrimaryButton 
            label="Done"
            onPress={handleDoneAddingWaypoint} 
          />
        )}
      </View>

      <RouteInformation
        onRouteNameChange={(segmentName) => updateRoute({ segmentName })}
        onLandmarkChange={(landmark) => updateRoute({ landmark })}
        onInstructionChange={(instruction) => updateRoute({ instruction })}
        onCostChange={(cost) => updateRoute({ cost: Number(cost) })}
        routeName={route.segmentName}
        landmark={route.landmark ?? ""}
        instruction={route.instruction ?? ""}
        cost={route.cost.toString()}
        bottomSheetModalRef={bottomSheetModalRef}
        updateRoute={updateRoute}
        isAddingWaypoints={isAddingWaypoints}
        handleToggleMode={handleToggleMode}
        clearWaypoints={clearWaypoints}
        getRouteDirections={getRouteDirections}
      />
    </SafeAreaView>
  );
}
